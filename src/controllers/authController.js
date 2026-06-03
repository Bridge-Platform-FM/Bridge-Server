'use strict';
const { errorLogger } = require('../configs/logger');
const authService = require('../services/authService');
const otpService = require('../services/otp.service');
const tokenService = require('../services/tokenService');
const { OTP_MESSAGES, AUTH_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');

/**
 * POST /api/v1/auth/company-registration
 */
const companyRegistration = async (req, res, next) => {
    try {
        const { companyName, email, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber } = req.body;

        if (!termsAccepted) {
            return HttpResponse.error(res, {
                message: 'You must accept the terms and conditions to register.',
                statusCode: 400
            }); 
        }

        const checkEmailExistsRes = await authService.checkEmailExists(email);
        if (!checkEmailExistsRes.success) {
            return HttpResponse.error(res, {
                message: checkEmailExistsRes.message,
                statusCode: checkEmailExistsRes.statusCode
            });
        }

        // remove termsAccepted from payload before saving in db
        const createCompanyRes = await authService.createCompany({companyName, email, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber});
        if (!createCompanyRes.success) {
            return HttpResponse.error(res, {message: createCompanyRes.message, statusCode: createCompanyRes.statusCode});
        }

        await otpService.sendOTP("EMAIL", email);
        await otpService.sendOTP("PHONE", phoneNumber);

        const tokens = await tokenService.generateTokens(createCompanyRes.data, role);
        const { accessToken, refreshToken } = tokens.data;

        return HttpResponse.success(res, {
            message: OTP_MESSAGES.SUCCESS,
            data: { accessToken, refreshToken},
            statusCode: 200
        });

    } catch (error) {
        errorLogger.error(error);
        console.error(error);
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

        let result;
        let statusResult;
        if (channel === 'EMAIL') {
            result = await otpService.verifyOTP(email, otp);
            if (!result.success) {
                return HttpResponse.error(res, {
                    message: result.message,
                    statusCode: result.statusCode
                });
            }
            statusResult = await authService.updateChannelVerifiedStatus('EMAIL', req.companyId);
        } else {
            result = await otpService.verifyOTP(phoneNumber, otp);
            if (!result.success) {
                return HttpResponse.error(res, {
                    message: result.message,
                    statusCode: result.statusCode
                });
            }
            statusResult = await authService.updateChannelVerifiedStatus('PHONE', req.companyId);
        }

        // If both channels verified, send status to client to enable continue button
        if (statusResult.success) {
            const companyData = statusResult.data;
            if (companyData.is_email_verified && companyData.is_mobile_number_verified) {
                return HttpResponse.success(res, {
                    message: OTP_MESSAGES.OTP_VERIFY_SUCCESS,
                    data: { bothChannelsVerified: true },
                    statusCode: 200
                });
            }
        }
        
        return HttpResponse.success(res, {
            message: OTP_MESSAGES.OTP_VERIFY_SUCCESS,
            statusCode: 200,
        });

    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: OTP_MESSAGES.OTP_VERIFICATION_FAILED,
            statusCode: 500
        });
    }
};

/**
 * POST /api/v1/auth/resend-otp
 */
const resendOtp = async (req, res, next) => {
    try {
        const { channel, email, phoneNumber } = req.body;

        let result;
        if (channel === 'EMAIL') {
            result = await otpService.sendOTP("email", email);
        } else {
            result = await otpService.sendOTP("phone", phoneNumber);
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

/**
 * POST /api/v1/auth/refresh
 */
const updateAccessToken = async (req, res, next) => {
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
            message: result.message,
            data: result.data,
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: AUTH_MESSAGES.TOKEN_REFRESH_FAILED,
            statusCode: 500
        });
    }
};

module.exports = {
    companyRegistration,
    verifyOtp,
    resendOtp,
    updateAccessToken
};
