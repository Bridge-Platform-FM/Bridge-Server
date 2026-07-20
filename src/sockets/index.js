'use strict';

const { errorLogger } = require('../configs/logger');
const { verifyAccessToken } = require('../utils/token');
const { ROLES } = require('../utils/constant');
const registerChatHandlers = require('./chatSocketHandler');
const registerDealRoomStageHandlers = require('./dealRoomStageSocketHandler');
<<<<<<< Updated upstream
=======
const registerOfferHandlers = require('./offerSocketHandler');
const registerTermSheetHandlers = require('./termSheetSocketHandler');
>>>>>>> Stashed changes
const { dealRoomChannel } = require('./dealRoomChannel');

let ioInstance = null;

const authenticateSocket = (socket, next) => {
    try {
        const token = socket.handshake.auth && socket.handshake.auth.token;
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
<<<<<<< Updated upstream
=======
        registerOfferHandlers(io, socket);
        registerTermSheetHandlers(io, socket);
>>>>>>> Stashed changes
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
