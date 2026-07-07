'use strict';

const { errorLogger } = require('../configs/logger');
const chatRepository = require('../repositories/chatRepository');
const dealRoomRepository = require('../repositories/dealRoomRepository');
const dealRoomService = require('./dealRoomService');
const { uploadToS3, getFileBuffer } = require('./s3.service');
const { CHAT_MEDIA_RULES } = require('../configs/scan');
const ServiceResponse = require('../utils/ServiceResponse');
const { DEAL_ROOM_STATUS, CHAT_MESSAGE_TYPE, CHAT_MESSAGES, S3_FILE_TYPE } = require('../utils/constant');

const resolveRecipient = (dealRoom, senderUserId) => {
    if (dealRoom.requester_user_id === senderUserId) {
        return { recipientUserId: dealRoom.recipient_user_id, recipientRoleId: dealRoom.recipient_role_id };
    }
    return { recipientUserId: dealRoom.requester_user_id, recipientRoleId: dealRoom.requester_role_id };
};

const authorize = async (dealRoomId, userId, { requireActive = false } = {}) => {
    const dealRoom = await dealRoomRepository.findById(dealRoomId);
    if (!dealRoom) {
        return { error: ServiceResponse.error({ message: CHAT_MESSAGES.DEAL_ROOM_NOT_FOUND, statusCode: 404 }) };
    }

    if (!dealRoomService.isParticipant(dealRoom, userId)) {
        return { error: ServiceResponse.error({ message: CHAT_MESSAGES.FORBIDDEN, statusCode: 403 }) };
    }

    if (requireActive && dealRoom.status !== DEAL_ROOM_STATUS.ACTIVE) {
        return { error: ServiceResponse.error({ message: CHAT_MESSAGES.DEAL_ROOM_CLOSED, statusCode: 400 }) };
    }

    return { dealRoom };
};

const sendMessage = async ({ dealRoomId, senderUserId, senderRoleId, message }) => {
    try {
        const { dealRoom, error } = await authorize(dealRoomId, senderUserId, { requireActive: true });
        if (error) {
            return error;
        }

        const { recipientUserId, recipientRoleId } = resolveRecipient(dealRoom, senderUserId);

        const saved = await chatRepository.create({
            deal_room_id: dealRoom.id,
            sender_user_id: senderUserId,
            sender_role_id: senderRoleId,
            recipient_user_id: recipientUserId,
            recipient_role_id: recipientRoleId,
            message,
            message_type: CHAT_MESSAGE_TYPE.TEXT,
            created_by: senderUserId
        });

        return ServiceResponse.success({ data: saved, message: CHAT_MESSAGES.SEND_SUCCESS, statusCode: 201 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: CHAT_MESSAGES.SEND_FAILED, statusCode: 500 });
    }
};

const sendMediaMessage = async ({ dealRoomId, senderUserId, senderRoleId, senderCompanyId, file, caption, download_allowed, view_only }) => {
    try {
        if (!file) {
            return ServiceResponse.error({ message: CHAT_MESSAGES.MEDIA_REQUIRED, statusCode: 400 });
        }

        const { dealRoom, error } = await authorize(dealRoomId, senderUserId, { requireActive: true });
        if (error) {
            return error;
        }

        const rule = CHAT_MEDIA_RULES[file.mimetype];
        if (!rule || file.size > rule.maxSize) {
            return ServiceResponse.error({ message: CHAT_MESSAGES.MEDIA_UPLOAD_FAILED, statusCode: 400 });
        }

        const s3_file_type = S3_FILE_TYPE.CHAT;
        const s3KeyToUpload = `dealroom/${dealRoomId}/${s3_file_type}/${Date.now()}-${file.originalname}`;
        const s3Key = await uploadToS3(S3_FILE_TYPE.CHAT, file.buffer, file.originalname, file.mimetype, senderCompanyId, senderUserId, s3KeyToUpload);

        const { recipientUserId, recipientRoleId } = resolveRecipient(dealRoom, senderUserId);

        const saved = await chatRepository.create({
            deal_room_id: dealRoom.id,
            sender_user_id: senderUserId,
            sender_role_id: senderRoleId,
            recipient_user_id: recipientUserId,
            recipient_role_id: recipientRoleId,
            message: caption || null,
            download_allowed: download_allowed, 
            view_only: view_only,
            message_type: rule.messageType,
            attachment_s3_key: s3Key,
            attachment_file_name: file.originalname,
            attachment_mime_type: file.mimetype,
            attachment_file_size: file.size,
            created_by: senderUserId
        });

        return ServiceResponse.success({ data: saved, message: CHAT_MESSAGES.MEDIA_UPLOAD_SUCCESS, statusCode: 201 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: CHAT_MESSAGES.MEDIA_UPLOAD_FAILED, statusCode: 500 });
    }
};

const getMessages = async (dealRoomId, userId, { cursor, limit } = {}) => {
    try {
        const { error } = await authorize(dealRoomId, userId);
        if (error) {
            return error;
        }

        const messages = await chatRepository.findByDealRoomId(dealRoomId, { cursor, limit });
        return ServiceResponse.success({ data: messages, message: CHAT_MESSAGES.FETCH_SUCCESS, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: CHAT_MESSAGES.FETCH_FAILED, statusCode: 500 });
    }
};

const getSharedFiles = async (dealRoomId, userId) => {
    try {
        const { error } = await authorize(dealRoomId, userId);
        if (error) {
            return error;
        }

        const files = await chatRepository.findSharedFilesByDealRoomId(dealRoomId);
        return ServiceResponse.success({ data: files, message: CHAT_MESSAGES.FILES_FETCH_SUCCESS, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: CHAT_MESSAGES.FILES_FETCH_FAILED, statusCode: 500 });
    }
};

const markRead = async (dealRoomId, userId) => {
    try {
        const { error } = await authorize(dealRoomId, userId);
        if (error) {
            return error;
        }

        await chatRepository.markReadByDealRoom(dealRoomId, userId);
        return ServiceResponse.success({ message: CHAT_MESSAGES.MARK_READ_SUCCESS, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: CHAT_MESSAGES.MARK_READ_FAILED, statusCode: 500 });
    }
};

const getMedia = async (dealRoomId, messageId, userId) => {
    try {
        const { error } = await authorize(dealRoomId, userId);
        if (error) {
            return error;
        }

        const chatMessage = await chatRepository.findById(messageId);
        if (!chatMessage || chatMessage.deal_room_id !== Number(dealRoomId) || !chatMessage.attachment_s3_key) {
            return ServiceResponse.error({ message: CHAT_MESSAGES.MESSAGE_NOT_FOUND, statusCode: 404 });
        }

        const buffer = await getFileBuffer(chatMessage.attachment_s3_key);
        return ServiceResponse.success({
            data: { buffer, mimeType: chatMessage.attachment_mime_type, fileName: chatMessage.attachment_file_name },
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: CHAT_MESSAGES.MEDIA_FETCH_FAILED, statusCode: 500 });
    }
};

module.exports = { sendMessage, sendMediaMessage, getMessages, getSharedFiles, markRead, getMedia, authorize };
