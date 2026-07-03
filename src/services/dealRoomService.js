'use strict';

const { errorLogger } = require('../configs/logger');
const dealRoomRepository = require('../repositories/dealRoomRepository');
const ServiceResponse = require('../utils/ServiceResponse');
const { DEAL_ROOM_MESSAGES } = require('../utils/constant');


const getDealRooms = async (userId, roleId) => {
    try {
        const dealRooms = await dealRoomRepository.findAllByUserId(userId, roleId);
        return ServiceResponse.success({ data: dealRooms, message: DEAL_ROOM_MESSAGES.FETCH_SUCCESS, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: DEAL_ROOM_MESSAGES.FETCH_FAILED, statusCode: 500 });
    }
};

const createDealRoom = async (connection) => {
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
        });

        return ServiceResponse.success({ data: dealRoom, message: DEAL_ROOM_MESSAGES.CREATE_SUCCESS, statusCode: 201 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: DEAL_ROOM_MESSAGES.CREATE_FAILED, statusCode: 500 });
    }
};

module.exports = { getDealRooms, createDealRoom };
