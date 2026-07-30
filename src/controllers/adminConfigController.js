const HttpResponse = require("../utils/HttpResponse");
const { errorLogger } = require("../configs/logger");
const { ADMIN_CONFIG_MESSAGES } = require('../utils/constant');
const adminConfigService = require('../services/adminConfigService');


const getOtpConfig = async (req, res, next) => {
    try {
        const getOtpConfigResp = await adminConfigService.getOtpConfig();
        if (!getOtpConfigResp.success) {
            return HttpResponse.error(res, {
                message: getOtpConfigResp.message,
                statusCode: getOtpConfigResp.statusCode
            });
        }
        const otpConfig = getOtpConfigResp.data;

        return HttpResponse.success(res, {
            message: ADMIN_CONFIG_MESSAGES.CONFIG_FETCH_SUCCESS,
            data: otpConfig,
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: ADMIN_CONFIG_MESSAGES.CONFIG_FETCH_FAILED,
            statusCode: 500
        });
    }
};

const updateOtpConfig = async (req, res, next) => {
    try {
        const { otpConfig } = req.body;
        const updateOtpConfigResp = await adminConfigService.updateOtpConfig(otpConfig, req.adminId);
        if (!updateOtpConfigResp.success) {
            return HttpResponse.error(res, {
                message: updateOtpConfigResp.message,
                statusCode: updateOtpConfigResp.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: ADMIN_CONFIG_MESSAGES.CONFIG_UPDATE_SUCCESS,
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: ADMIN_CONFIG_MESSAGES.CONFIG_UPDATE_FAILED,
            statusCode: 500
        });
    }
};

module.exports = { getOtpConfig, updateOtpConfig };