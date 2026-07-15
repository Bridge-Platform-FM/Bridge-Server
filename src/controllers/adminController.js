'use strict';
const Joi = require('joi');
const { ADMIN_MESSAGES, OTP_MESSAGES, CHANNEL_TYPE, REDIRECT_ROUTES, KYC_MESSAGES, USER_LIMIT_CONFIG_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');
const { errorLogger } = require('../configs/logger');
const adminService = require('../services/adminService');
const otpService = require('../services/otp.service');
const userService = require('../services/userService');
const kycService = require('../services/kycService');

const updateLimitConfigSchema = Joi.object({
    allowed_connections: Joi.number().integer().min(0).optional(),
    allowed_free_trial_days: Joi.number().integer().min(0).optional(),
    allowed_premium_days: Joi.number().integer().min(0).optional()
}).min(1).messages({
    'object.min': 'At least one limit configuration field must be provided'
});

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await adminService.login(email, password);
        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        return HttpResponse.success(res, { message: result.message, data: result.data, statusCode: result.statusCode });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: ADMIN_MESSAGES.LOGIN_FAILED, statusCode: 500 });
    }
};

const triggerOtp = async (req, res, next) => {
    try {
        const email = req.email;
        const mobileNumber = req.mobileNumber;

        const { channel } = req.body;

        let result;
        if (channel === CHANNEL_TYPE.EMAIL) {
            result = await otpService.sendOTP(CHANNEL_TYPE.EMAIL, email);
        } else {
            result = await otpService.sendOTP(CHANNEL_TYPE.PHONE, mobileNumber);
        }

        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        return HttpResponse.success(res, { message: OTP_MESSAGES.OTP_SEND_SUCCESS, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: OTP_MESSAGES.OTP_GENERATION_FAILED, statusCode: 500 });
    }
};

const verifyMfaOtp = async (req, res, next) => {
    try {
        const email = req.email;
        const mobileNumber = req.mobileNumber;

        const { otp, channel } = req.body;
        let channelId = channel === CHANNEL_TYPE.EMAIL ? email : mobileNumber;

        const verifyOtpRes = await otpService.verifyOTP(channelId, otp);

        if (!verifyOtpRes.success) {
            return HttpResponse.error(res, { message: verifyOtpRes.message, statusCode: verifyOtpRes.statusCode });
        }

        let redirectRoute = REDIRECT_ROUTES.DASHBOARD.DASHBOARD;

        const adminRes = await adminService.findByEmail(email);
        if (!adminRes.success) {
            return HttpResponse.error(res, { message: adminRes.message, statusCode: adminRes.statusCode });
        }

        const admin = adminRes.data;
        
        return HttpResponse.success(res, { message: OTP_MESSAGES.OTP_VERIFY_SUCCESS, data: { first_name: admin.name, role: admin.role, redirectRoute: redirectRoute }, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: OTP_MESSAGES.OTP_VERIFICATION_FAILED, statusCode: 500 });
    }
};

const resendMfaOtp = async (req, res, next) => {
    try {
        const email = req.email;
        const mobileNumber = req.mobileNumber;
        const { channel } = req.body;

        let result;
        if (channel === 'EMAIL') {
            result = await otpService.sendOTP(CHANNEL_TYPE.EMAIL, email);
        } else {
            result = await otpService.sendOTP(CHANNEL_TYPE.PHONE, mobileNumber);
        }

        if (!result.success) {
            return HttpResponse.error(res, {
                message: result.message,
                statusCode: 400
            });
        }

        return HttpResponse.success(res, {
            message: OTP_MESSAGES.OTP_SEND_SUCCESS,
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: OTP_MESSAGES.OTP_GENERATION_FAILED,
            statusCode: 500
        });
    }
};

const getUserList = async (req, res, next) => {
    try {
        const userListRes = await userService.getUserList();
        if (!userListRes.success) {
            return HttpResponse.error(res, { message: userListRes.message, statusCode: userListRes.statusCode });
        }

        const userList = userListRes.data;

        return HttpResponse.success(res, { message: userListRes.message, data: userList, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { data: [], statusCode: 500 });
    }
};


const getUserKycDocs = async (req, res, next) => {
    try {
        const userListRes = await userService.getUserKycDocs();
        if (!userListRes.success) {
            return HttpResponse.error(res, { message: userListRes.message, statusCode: userListRes.statusCode });
        }

        const userList = userListRes.data;

        return HttpResponse.success(res, { message: userListRes.message, data: userList, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { data: [], statusCode: 500 });
    }
};

const kycDocumentAction = async (req, res, next) => {
    try {
        const adminId = req.adminId;
        const { kyc_id, action } = req.body;

        if (!kyc_id || !action) {
            return HttpResponse.error(res, { message: 'kyc_id and action are required', statusCode: 400 });
        }

        if (!['approve', 'reject'].includes(action)) {
            return HttpResponse.error(res, { message: 'action must be approve or reject', statusCode: 400 });
        }

        const result = await kycService.updateDocumentStatus({ kycInfoId: kyc_id, action, adminId });

        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        return HttpResponse.success(res, { message: result.message, data: result.data, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: KYC_MESSAGES.DOCUMENT_ACTION_FAILED, statusCode: 500 });
    }
};

const kycReviewAction = async (req, res, next) => {
    try {
        const adminId = req.adminId;
        const { company_id, action, rejection_reason } = req.body;

        if (!company_id || !action) {
            return HttpResponse.error(res, { message: 'company_id and action are required', statusCode: 400 });
        }

        if (!['approve', 'reject'].includes(action)) {
            return HttpResponse.error(res, { message: 'action must be approve or reject', statusCode: 400 });
        }

        if (action === 'reject' && !rejection_reason) {
            return HttpResponse.error(res, { message: 'rejection_reason is required when rejecting', statusCode: 400 });
        }

        const result = await kycService.updateReviewStatus({
            companyId: company_id,
            action,
            rejectionReason: rejection_reason,
            adminId
        });

        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        return HttpResponse.success(res, { message: result.message, data: result.data, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: KYC_MESSAGES.REVIEW_ACTION_FAILED, statusCode: 500 });
    }
};

const getUserLimitConfig = async (req, res, next) => {
    try {
        const { role: adminRole } = req;
        const userId = parseInt(req.params.userId);

        if (!userId || isNaN(userId)) {
            return HttpResponse.error(res, {
                message: USER_LIMIT_CONFIG_MESSAGES.INVALID_USER_ID,
                statusCode: 400
            });
        }

        const serviceResponse = await adminService.getUserLimitConfig({ userId, adminRole });

        if (!serviceResponse.success) {
            return HttpResponse.error(res, {
                message: serviceResponse.message,
                data: serviceResponse.data,
                statusCode: serviceResponse.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: serviceResponse.message,
            data: serviceResponse.data,
            statusCode: serviceResponse.statusCode
        });

    } catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: USER_LIMIT_CONFIG_MESSAGES.FETCH_FAILED,
            statusCode: 500
        });
    }
};

const updateUserLimitConfig = async (req, res, next) => {
    try {
        const { role: adminRole, adminId } = req;
        const userId = parseInt(req.params.userId);

        if (!userId || isNaN(userId)) {
            return HttpResponse.error(res, {
                message: USER_LIMIT_CONFIG_MESSAGES.INVALID_USER_ID,
                statusCode: 400
            });
        }

        const { error: validationError, value: payload } = updateLimitConfigSchema.validate(req.body, {
            abortEarly: false
        });

        if (validationError) {
            return HttpResponse.error(res, {
                message: validationError.details.map(d => d.message).join(', '),
                statusCode: 400
            });
        }

        const serviceResponse = await adminService.updateUserLimitConfig({
            userId,
            adminId,
            adminRole,
            payload
        });

        if (!serviceResponse.success) {
            return HttpResponse.error(res, {
                message: serviceResponse.message,
                data: serviceResponse.data,
                statusCode: serviceResponse.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: serviceResponse.message,
            data: serviceResponse.data,
            statusCode: serviceResponse.statusCode
        });

    } catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: USER_LIMIT_CONFIG_MESSAGES.UPDATE_FAILED,
            statusCode: 500
        });
    }
};

module.exports = { login, triggerOtp, verifyMfaOtp, resendMfaOtp, getUserList, getUserKycDocs, kycDocumentAction, kycReviewAction, getUserLimitConfig, updateUserLimitConfig };