'use strict';
const { errorLogger } = require('../configs/logger');
const fieldMetadataService = require('../services/fieldMetadataService');
const userService = require('../services/userService');
const { USER_MESSAGES } = require('../utils/constant');
const { encrypt } = require('../utils/encryption');
const HttpResponse = require('../utils/HttpResponse');



const createUserProfile = async (req, res, next) => {
    try {
        const { companyId, email, role } = req;
        const requestPayload = req.body;
        const validationResult = await fieldMetadataService.validateUserPayload(role, requestPayload);
        if (!validationResult.success) {
            return HttpResponse.error(res, {
                message: validationResult.message,
                data: validationResult.data,
                statusCode: validationResult.statusCode
            });
        }
        const userData = { ...requestPayload };

        const userProfileResponse = await userService.createUserProfile({ userData, companyId, role });
        if (!userProfileResponse.success) {
            return HttpResponse.error(res, {
                message: userProfileResponse.message,
                data: userProfileResponse.data,
                statusCode: userProfileResponse.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: userProfileResponse.message,
            data: userProfileResponse.data,
            statusCode: userProfileResponse.statusCode
        });
    } catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, { message: USER_MESSAGES.CREATE_FAILED, statusCode: 500 });
    }
};

module.exports = { createUserProfile };
