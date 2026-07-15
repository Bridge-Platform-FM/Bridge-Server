'use strict';

const { sequelize } = require('../models');
const { errorLogger } = require('../configs/logger');
const dealRoomRepository = require('../repositories/dealRoomRepository');
const dealRoomStageRequestRepository = require('../repositories/dealRoomStageRequestRepository');
const dealRoomStageRequestLogRepository = require('../repositories/dealRoomStageRequestLogRepository');
const ServiceResponse = require('../utils/ServiceResponse');
const { DEAL_ROOM_STATUS, DEAL_ROOM_MESSAGES, DEAL_ROOM_STAGES, DEAL_ROOM_STAGE_REQUEST_STATUS, DEAL_ROOM_STAGE_MESSAGES } = require('../utils/constant');


const getDealRooms = async (userId, roleId) => {
    try {
        const dealRooms = await dealRoomRepository.findAllByUserId(userId, roleId);
        return ServiceResponse.success({ data: dealRooms, message: DEAL_ROOM_MESSAGES.FETCH_SUCCESS, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: DEAL_ROOM_MESSAGES.FETCH_FAILED, statusCode: 500 });
    }
};

const isParticipant = (dealRoom, userId) => {
    return dealRoom.requester_user_id === userId || dealRoom.recipient_user_id === userId;
};

const createDealRoom = async (connection, { transaction } = {}) => {
    try {
        const dealRoom = await dealRoomRepository.create({
            connection_id: connection.id,
            requester_user_id: connection.requester_user_id,
            requester_role_id: connection.requester_role_id,
            requester_company_id: connection.requester_company_id,
            recipient_user_id: connection.recipient_user_id,
            recipient_role_id: connection.recipient_role_id,
            recipient_company_id: connection.recipient_company_id,
            created_by: connection.recipient_user_id
        }, { transaction });

        return ServiceResponse.success({ data: dealRoom, message: DEAL_ROOM_MESSAGES.CREATE_SUCCESS, statusCode: 201 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: DEAL_ROOM_MESSAGES.CREATE_FAILED, statusCode: 500 });
    }
};

const closeDealRoom = async (dealRoomId, { reason, userId }) => {
    const transaction = await sequelize.transaction();
    try {
        const dealRoom = await dealRoomRepository.findById(dealRoomId);
        if (!dealRoom) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_MESSAGES.NOT_FOUND, statusCode: 404 });
        }

        if (dealRoom.status === DEAL_ROOM_STATUS.CLOSED) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_MESSAGES.ALREADY_CLOSED, statusCode: 400 });
        }

        if (!isParticipant(dealRoom, userId)) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_MESSAGES.FORBIDDEN, statusCode: 403 });
        }

        const updated = await dealRoomRepository.closeById(dealRoomId, {
            closedReason: reason || null,
            closedBy: userId
        }, { transaction });

        await transaction.commit();
        return ServiceResponse.success({ data: updated, message: DEAL_ROOM_MESSAGES.CLOSE_SUCCESS, statusCode: 200 });
    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({ message: DEAL_ROOM_MESSAGES.CLOSE_FAILED, statusCode: 500 });
    }
};

const requestStageUpdate = async ({ dealRoomId, requestedStage, requestedByUserId, requestedByRoleId }) => {
    const transaction = await sequelize.transaction();
    try {
        const dealRoom = await dealRoomRepository.findById(dealRoomId);
        if (!dealRoom) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.DEAL_ROOM_NOT_FOUND, statusCode: 404 });
        }

        if (!isParticipant(dealRoom, requestedByUserId)) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.FORBIDDEN, statusCode: 403 });
        }

        if (dealRoom.status !== DEAL_ROOM_STATUS.ACTIVE) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.DEAL_ROOM_CLOSED, statusCode: 400 });
        }

        if (!Object.values(DEAL_ROOM_STAGES).includes(requestedStage)) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.INVALID_STAGE, statusCode: 400 });
        }

        if (requestedStage === dealRoom.stage) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.SAME_STAGE, statusCode: 400 });
        }

        const pending = await dealRoomStageRequestRepository.findPendingByDealRoomId(dealRoomId);
        if (pending) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.REQUEST_PENDING_EXISTS, statusCode: 409 });
        }

        const stageRequest = await dealRoomStageRequestRepository.create({
            deal_room_id: dealRoomId,
            requested_by_user_id: requestedByUserId,
            requested_by_role_id: requestedByRoleId,
            current_stage: dealRoom.stage,
            requested_stage: requestedStage,
            status: DEAL_ROOM_STAGE_REQUEST_STATUS.PENDING,
            created_by: requestedByUserId
        }, { transaction });

        // Every request/response is logged here — this is the activity trail for stage changes.
        await dealRoomStageRequestLogRepository.create({
            deal_room_stage_request_id: stageRequest.id,
            status: DEAL_ROOM_STAGE_REQUEST_STATUS.PENDING,
            changed_by: requestedByUserId
        }, { transaction });

        await transaction.commit();
        return ServiceResponse.success({ data: stageRequest, message: DEAL_ROOM_STAGE_MESSAGES.REQUEST_SUCCESS, statusCode: 201 });
    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.REQUEST_FAILED, statusCode: 500 });
    }
};

const respondStageUpdate = async ({ dealRoomId, requestId, decision, respondedByUserId }) => {
    const transaction = await sequelize.transaction();
    try {
        if (![DEAL_ROOM_STAGE_REQUEST_STATUS.ACCEPTED, DEAL_ROOM_STAGE_REQUEST_STATUS.REJECTED].includes(decision)) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.INVALID_DECISION, statusCode: 400 });
        }

        const dealRoom = await dealRoomRepository.findById(dealRoomId);
        if (!dealRoom) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.DEAL_ROOM_NOT_FOUND, statusCode: 404 });
        }

        if (!isParticipant(dealRoom, respondedByUserId)) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.FORBIDDEN, statusCode: 403 });
        }

        const stageRequest = await dealRoomStageRequestRepository.findById(requestId);
        if (!stageRequest || stageRequest.deal_room_id !== dealRoomId) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.REQUEST_NOT_FOUND, statusCode: 404 });
        }

        if (stageRequest.status !== DEAL_ROOM_STAGE_REQUEST_STATUS.PENDING) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.REQUEST_NOT_PENDING, statusCode: 400 });
        }

        if (stageRequest.requested_by_user_id === respondedByUserId) {
            await transaction.rollback();
            return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.CANNOT_RESPOND_OWN_REQUEST, statusCode: 403 });
        }

        const updatedRequest = await dealRoomStageRequestRepository.respond(requestId, {
            status: decision,
            respondedByUserId
        }, { transaction });

        await dealRoomStageRequestLogRepository.create({
            deal_room_stage_request_id: requestId,
            status: decision,
            changed_by: respondedByUserId
        }, { transaction });

        let updatedDealRoom = dealRoom;
        if (decision === DEAL_ROOM_STAGE_REQUEST_STATUS.ACCEPTED) {
            updatedDealRoom = await dealRoomRepository.updateStage(dealRoomId, stageRequest.requested_stage, {
                updatedBy: respondedByUserId,
                transaction
            });
        }

        await transaction.commit();
        return ServiceResponse.success({
            data: { request: updatedRequest, dealRoom: updatedDealRoom },
            message: DEAL_ROOM_STAGE_MESSAGES.RESPOND_SUCCESS,
            statusCode: 200
        });
    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({ message: DEAL_ROOM_STAGE_MESSAGES.RESPOND_FAILED, statusCode: 500 });
    }
};

module.exports = { getDealRooms, createDealRoom, closeDealRoom, isParticipant, requestStageUpdate, respondStageUpdate };
