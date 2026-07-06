'use strict';

const { errorLogger } = require('../configs/logger');
const dealRoomService = require('../services/dealRoomService');
const HttpResponse = require('../utils/HttpResponse');

const getDealRooms = async (req, res, next) => {
    try {
        const { userId, roleId } = req;

        const result = await dealRoomService.getDealRooms(userId, roleId);

        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        return HttpResponse.success(res, { data: result.data, message: result.message, statusCode: result.statusCode });

    } catch (error) {
        errorLogger.error(error);
        next(error);
    }
};

const closeDealRoom = async (req, res, next) => {
    try {
        const dealRoomId = Number(req.params.dealRoomId);
        if (!Number.isInteger(dealRoomId) || dealRoomId <= 0) {
            return HttpResponse.error(res, { message: 'dealRoomId must be a positive integer', statusCode: 400 });
        }

        const { reason } = req.body;
        const { userId } = req;

        const result = await dealRoomService.closeDealRoom(dealRoomId, { reason, userId });

        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        return HttpResponse.success(res, { data: result.data, message: result.message, statusCode: result.statusCode });

    } catch (error) {
        errorLogger.error(error);
        next(error);
    }
};

module.exports = { getDealRooms, closeDealRoom };
