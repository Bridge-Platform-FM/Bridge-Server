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
        const userId = req.userId;
        const roleId = req.roleId;
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

        const userProfileResponse = await userService.createUserProfile({ userData, companyId, userId, roleId });
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

const getUserProfile = async (req, res, next) => {
    try {
        const { companyId } = req;
        const userId = req.userId;
        const roleId = req.roleId;

        const profileResponse = await userService.getUserProfile({ companyId, userId, roleId });
        if (!profileResponse.success) {
            return HttpResponse.error(res, {
                message: profileResponse.message,
                data: profileResponse.data,
                statusCode: profileResponse.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: profileResponse.message,
            data: profileResponse.data,
            statusCode: profileResponse.statusCode
        });
    } catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, { message: 'Failed to retrieve profile details.', statusCode: 500 });
    }
};

const updateUserProfile = async (req, res, next) => {
    try {

        const companyId = req.companyId; ;
        const userId = req.userId;
        const roleId = req.roleId;
    
        const requstPayload = req.body;
    
        const updateUserRes = await userService.updateUserProfile(requstPayload, userId);
        if (!updateUserRes.success) {
            return HttpResponse.error(res, {
                message: updateUserRes.message,
                data: updateUserRes.data,
                statusCode: updateUserRes.statusCode
            });
    
        }
        return HttpResponse.success(res, {
            message: updateUserRes.message,
            data: updateUserRes.data,
            statusCode: updateUserRes.statusCode
        });
    }
    catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, { message: USER_MESSAGES.UPDATE_FAILED, statusCode: 500 });
    }
};

module.exports = { createUserProfile, getUserProfile, updateUserProfile };
