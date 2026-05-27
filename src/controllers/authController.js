'use strict';
const authService = require('../services/authService');
const otpService = require('../services/otpService');
const tokenService = require('../services/tokenService');
const HttpResponse = require('../utils/HttpResponse');

/**
 * POST /api/v1/auth/company-registration
 */
const companyRegistration = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const ServiceResponse = await authService.initiateRegistration(reqBody);

        if (!ServiceResponse.success) {
            return HttpResponse.error(res, {
                message: ServiceResponse.message,
                statusCode: 400
            });
        }
        const registrationPayload = ServiceResponse.data;

        const otps = await otpService.generateAndSendOtp(
            registrationPayload.email,
            registrationPayload.phoneNumber,
            registrationPayload
        );

        // Print OTP to terminal is done inside the service.
        // As requested, we also send the OTPs back to the frontend.
        return HttpResponse.success(res, {
            message: otps.message,
            data: otps.data
        });
    } catch (error) {
        next(error);
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
