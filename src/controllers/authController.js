'use strict';
const { errorLogger } = require('../configs/logger');
const authService = require('../services/authService');
const otpService = require('../services/otpService');
const tokenService = require('../services/tokenService');
const { OTP_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');

/**
 * POST /api/v1/auth/company-registration
 */
const companyRegistration = async (req, res, next) => {
    try {
        const { companyName, email, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber } = req.body;

        const checkEmailExistsRes = await authService.checkEmailExists(email);
        if (!checkEmailExistsRes.success) {
            return HttpResponse.error(res, {
                message: checkEmailExistsRes.message,
                statusCode: checkEmailExistsRes.statusCode
            });
        }

        const registrationPayloadRes = await authService.prepareOtpPayload(companyName, email, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber);
        if (!registrationPayloadRes.success) {
            return HttpResponse.error(res, {message: registrationPayloadRes.message, statusCode: registrationPayloadRes.statusCode});
        }

        const registrationPayload = registrationPayloadRes.data;

        const emailOtp = otpService.generateOtp();
        const phoneNumberOtp = otpService.generateOtp();

        const storeOtpRes = await otpService.storeOtp(email, emailOtp, phoneNumber, phoneNumberOtp, registrationPayload);
        if (!storeOtpRes.success) {
            return HttpResponse.error(res, {message: storeOtpRes.message, statusCode: storeOtpRes.statusCode});
        }

        console.info(emailOtp);
        console.info(phoneNumberOtp);
        
        return HttpResponse.success(res, {
            message: OTP_MESSAGES.SUCCESS,
            data: {emailOtp, phoneNumberOtp},
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: error.message,
            statusCode: 500
        });
    }
};

/**
 * POST /api/v1/auth/verify-otp
 */
const verifyOtp = async (req, res, next) => {
    try {
        const { channel, otp, email, phoneNumber } = req.body;
        const identifier = channel.toUpperCase() === 'EMAIL' ? email : phoneNumber;

        const result = await authService.verifyOtp(channel, identifier, otp);

        if (!result.success) {
            return HttpResponse.error(res, {
                message: result.message,
                statusCode: 400
            });
        }

        if (result.data.isCompleted) {
            return HttpResponse.success(res, {
                message: 'Registration successful',
                data: result.data,
                statusCode: 201
            });
        }

        return HttpResponse.success(res, {
            message: result.message,
            statusCode: 200
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/resend-otp
 */
const resendOtp = async (req, res, next) => {
    try {
        const { channel, email, phoneNumber } = req.body;
        const identifier = channel.toUpperCase() === 'EMAIL' ? email : phoneNumber;

        const result = await otpService.resendOtp(channel, identifier);

        if (!result.success) {
            return HttpResponse.error(res, {
                message: result.message,
                statusCode: 400
            });
        }

        return HttpResponse.success(res, {
            message: 'OTP sent successfully',
            data: { otp: result.data.otp },
            statusCode: 200
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await tokenService.refreshToken(refreshToken);

        if (!result.success) {
            return HttpResponse.error(res, {
                message: result.message,
                statusCode: 401
            });
        }

        return HttpResponse.success(res, {
            message: 'Token refreshed successfully',
            data: result.data,
            statusCode: 200
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    companyRegistration,
    verifyOtp,
    resendOtp,
    refreshToken
};
