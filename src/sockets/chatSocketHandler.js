'use strict';

const { errorLogger } = require('../configs/logger');
const chatService = require('../services/chatService');
const dealRoomRepository = require('../repositories/dealRoomRepository');
const dealRoomService = require('../services/dealRoomService');
const { dealRoomChannel } = require('./dealRoomChannel');
const { SOCKET_EVENTS } = require('../utils/constant');

const registerChatHandlers = (io, socket) => {

    const emitError = (message) => {
        socket.emit(SOCKET_EVENTS.ERROR, { message });
    };

    socket.on(SOCKET_EVENTS.JOIN_DEAL_ROOM, async ({ dealRoomId } = {}) => {
        try {
            if (!dealRoomId) {
                return emitError('dealRoomId is required');
            }

            const dealRoom = await dealRoomRepository.findById(dealRoomId);
            if (!dealRoom) {
                return emitError('Deal room not found');
            }
            if (!dealRoomService.isParticipant(dealRoom, socket.userId)) {
                return emitError('You are not authorized to access this deal room chat');
            }

            socket.join(dealRoomChannel(dealRoomId));
        } catch (error) {
            errorLogger.error(error);
            emitError('Unable to join deal room');
        }
    });

    socket.on(SOCKET_EVENTS.LEAVE_DEAL_ROOM, ({ dealRoomId } = {}) => {
        if (!dealRoomId) return;
        socket.leave(dealRoomChannel(dealRoomId));
    });

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async ({ dealRoomId, message } = {}) => {
        try {
            if (!dealRoomId || !message) {
                return emitError('dealRoomId and message are required');
            }

            const result = await chatService.sendMessage({
                dealRoomId,
                senderUserId: socket.userId,
                senderRoleId: socket.roleId,
                message
            });

            if (!result.success) {
                return emitError(result.message);
            }

            io.to(dealRoomChannel(dealRoomId)).emit(SOCKET_EVENTS.NEW_MESSAGE, result.data);
        } catch (error) {
            errorLogger.error(error);
            emitError('Unable to send message');
        }
    });

    socket.on(SOCKET_EVENTS.MARK_READ, async ({ dealRoomId } = {}) => {
        try {
            if (!dealRoomId) {
                return emitError('dealRoomId is required');
            }

            const result = await chatService.markRead(dealRoomId, socket.userId);
            if (!result.success) {
                return emitError(result.message);
            }

            io.to(dealRoomChannel(dealRoomId)).emit(SOCKET_EVENTS.MESSAGES_READ, { dealRoomId, readBy: socket.userId });
        } catch (error) {
            errorLogger.error(error);
            emitError('Unable to mark messages as read');
        }
    });

    socket.on(SOCKET_EVENTS.TYPING, ({ dealRoomId } = {}) => {
        if (!dealRoomId) return;
        socket.to(dealRoomChannel(dealRoomId)).emit(SOCKET_EVENTS.USER_TYPING, { dealRoomId, userId: socket.userId, typing: true });
    });

    socket.on(SOCKET_EVENTS.STOP_TYPING, ({ dealRoomId } = {}) => {
        if (!dealRoomId) return;
        socket.to(dealRoomChannel(dealRoomId)).emit(SOCKET_EVENTS.USER_TYPING, { dealRoomId, userId: socket.userId, typing: false });
    });
};

module.exports = registerChatHandlers;
