'use strict';
const { ADMIN_MESSAGES, OTP_MESSAGES, CHANNEL_TYPE, REDIRECT_ROUTES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');
const { errorLogger } = require('../configs/logger');
const adminService = require('../services/adminService');
const otpService = require('../services/otp.service');


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
        
        return HttpResponse.success(res, { message: OTP_MESSAGES.OTP_VERIFY_SUCCESS, data: { redirectRoute: redirectRoute }, statusCode: 200 });
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


module.exports = { login, triggerOtp, verifyMfaOtp, resendMfaOtp };
