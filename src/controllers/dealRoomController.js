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

module.exports = { getDealRooms };
