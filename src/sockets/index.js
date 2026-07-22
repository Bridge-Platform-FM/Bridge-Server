'use strict';

const { errorLogger } = require('../configs/logger');
const { verifyAccessToken } = require('../utils/token');
const { ROLES } = require('../utils/constant');
const { parseCookieHeader, COOKIE_NAMES } = require('../utils/cookies');
const registerChatHandlers = require('./chatSocketHandler');
const registerDealRoomStageHandlers = require('./dealRoomStageSocketHandler');

const registerOfferHandlers = require('./offerSocketHandler');
const registerTermSheetHandlers = require('./termSheetSocketHandler');

const { dealRoomChannel } = require('./dealRoomChannel');

let ioInstance = null;

const authenticateSocket = (socket, next) => {
    try {
        // Prefer the httpOnly cookie sent with the handshake (withCredentials);
        // fall back to an explicit auth.token for un-migrated clients.
        const cookies = parseCookieHeader(socket.handshake.headers && socket.handshake.headers.cookie);
        const token = cookies[COOKIE_NAMES.ACCESS]
            || (socket.handshake.auth && socket.handshake.auth.token);
        if (!token) {
            return next(new Error('Unauthorized'));
        }

        const decoded = verifyAccessToken(token);
        if (!ROLES.USER.includes(decoded.role)) {
            return next(new Error('Forbidden'));
        }

        socket.userId = decoded.userId;
        socket.roleId = decoded.roleId;
        socket.companyId = decoded.companyId;
        socket.role = decoded.role;
        next();
    } catch (error) {
        next(new Error('Unauthorized'));
    }
};

const initSockets = (io) => {
    ioInstance = io;

    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        registerChatHandlers(io, socket);
        registerDealRoomStageHandlers(io, socket);
        registerOfferHandlers(io, socket);
        registerTermSheetHandlers(io, socket);
    });
};

const emitToDealRoom = (dealRoomId, event, payload) => {
    if (!ioInstance) {
        errorLogger.error(new Error('emitToDealRoom called before sockets were initialized'));
        return;
    }
    ioInstance.to(dealRoomChannel(dealRoomId)).emit(event, payload);
};

module.exports = { initSockets, emitToDealRoom };
