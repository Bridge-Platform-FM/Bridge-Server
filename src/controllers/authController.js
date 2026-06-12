'use strict';
const { errorLogger } = require('../configs/logger');
const authService = require('../services/authService');
const otpService = require('../services/otp.service');
const tokenService = require('../services/tokenService');
const { OTP_MESSAGES, AUTH_MESSAGES, CHANNEL_TYPE, REGISTRATION_MESSAGES, USER_MESSAGES, LOGIN_MESSAGES, REDIRECT_ROUTES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');

//  POST /api/v1/auth/company-registration
const companyRegistration = async (req, res, next) => {
    try {
        const { companyName, email, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber } = req.body;

        if (!termsAccepted) {
            return HttpResponse.error(res, {
                message: 'You must accept the terms and conditions to register.',
                statusCode: 400
            });
        }

        const existingCompanyRes = await authService.getCompanyByEmail(email);
        if (!existingCompanyRes.success) {
            return HttpResponse.error(res, {
                message: existingCompanyRes.message,
                statusCode: existingCompanyRes.statusCode
            });
        }

        const existingCompany = existingCompanyRes.data;
        if (existingCompany) {
            return HttpResponse.error(res, {message:USER_MESSAGES.EMAIL_ALREADY_EXISTS, statusCode:400});
        }
        
        // TODO: handle service response
        const emailOtpRes = await otpService.sendOTP(CHANNEL_TYPE.EMAIL, email);
        if (!emailOtpRes.success) {
            return HttpResponse.error(res, {
                message: REGISTRATION_MESSAGES.COMPANY_CREATION_FAILED,
                statusCode: 500
            });
        }
        const phoneOtpRes = await otpService.sendOTP(CHANNEL_TYPE.PHONE, phoneNumber);
        if (!phoneOtpRes.success) {
            return HttpResponse.error(res, {
                message: REGISTRATION_MESSAGES.COMPANY_CREATION_FAILED,
                statusCode: 500
            });
        }
        
        // remove termsAccepted from payload before saving in db
        const createCompanyRes = await authService.createCompany({ companyName, email, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber });
        if (!createCompanyRes.success) {
            return HttpResponse.error(res, { message: createCompanyRes.message, statusCode: createCompanyRes.statusCode });
        }
        
        const companyObj = createCompanyRes.data.company
        const roleObj = createCompanyRes.data.role
        const userObj = createCompanyRes.data.user


        const tokens = await tokenService.generateTokens(companyObj, roleObj, userObj);
        const { accessToken, refreshToken } = tokens.data;

        return HttpResponse.success(res, {
            message: OTP_MESSAGES.SUCCESS,
            data: { accessToken, refreshToken },
            statusCode: 200
        });

    } catch (error) {
        errorLogger.error(error);
        console.error(error);
        return HttpResponse.error(res, {
            message: REGISTRATION_MESSAGES.COMPANY_CREATION_FAILED,
            statusCode: 500
        });
    }
};


//  POST /api/v1/auth/verify-otp
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

        if (!statusResult.success) {
            return HttpResponse.error(res, {
                message: statusResult.message,
                statusCode: statusResult.statusCode
            });
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

//  POST /api/v1/auth/resend-otp
const resendOtp = async (req, res, next) => {
    try {
        const { channel, email, phoneNumber } = req.body;

        let result;
        if (channel === 'EMAIL') {
            result = await otpService.sendOTP(CHANNEL_TYPE.EMAIL, email);
        } else {
            result = await otpService.sendOTP(CHANNEL_TYPE.PHONE, phoneNumber);
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

//  POST /api/v1/auth/refresh
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

//  POST /api/v1/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const existingCompanyRes = await authService.getCompanyByEmail(email);
        if (!existingCompanyRes.success) {
            return HttpResponse.error(res, { message: existingCompanyRes.message, statusCode: existingCompanyRes.statusCode });
        }

        const existingCompany = existingCompanyRes.data;

        if (!existingCompany) {
            return HttpResponse.error(res, { message: LOGIN_MESSAGES.INVALID_CREDENTIALS, statusCode: existingCompanyRes.statusCode });
        }

        const passwordRes = await authService.checkPassword(password, existingCompany.password)
        if (!passwordRes.success) {
            return HttpResponse.error(res, { message: LOGIN_MESSAGES.INVALID_CREDENTIALS, statusCode: existingCompany.statusCode });
        }

        const existingUserRes = await authService.getUserByEmail(email);
        if (!existingUserRes.success) {
            return HttpResponse.error(res, { message: LOGIN_MESSAGES.INVALID_CREDENTIALS, statusCode: existingCompany.statusCode });
        }

        const existingUser = existingUserRes.data

        const companyUserRoleRes = await authService.getCompanyUser_role(existingCompany.id, existingUser.id);
        if (!companyUserRoleRes) {
            return HttpResponse.error(res, { message: LOGIN_MESSAGES.INVALID_CREDENTIALS, statusCode: companyUserRoleRes.statusCode });
        }

        const role = companyUserRoleRes.data;

        const maskedMobile = existingCompany.country_code + existingCompany.mobile_number;
        const maskedEmail = existingCompany.company_email;

        const tokens = await tokenService.generateTokens(existingCompany, role, existingUser);
        const { accessToken, refreshToken } = tokens.data;

        return HttpResponse.success( res, {data: { accessToken, refreshToken, role: role.role_code, maskedMobile, maskedEmail }, message: LOGIN_MESSAGES.VALID_CREDENTIALS })
    } catch (error) {
        console.error(error)
        errorLogger.error(error);
        return HttpResponse.error(res, { message: AUTH_MESSAGES.LOGIN_FAILED, statusCode: 500 });
    }
};

//  POST /api/v1/auth/trigger-otp
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

const verifyMfaOtp = async (req, res, nex) => {
    try {
        const email = req.email;

        const existingCompanyRes = await authService.getCompanyByEmail(email);
        if (!existingCompanyRes.success) {
            return HttpResponse.error(res, {
                message: existingCompanyRes.message,
                statusCode: existingCompanyRes.statusCode
            });
        }

        const company = existingCompanyRes.data;

        const mobileNumber = company.mobile_number;

        const { otp, channel } = req.body;
        let channelId = channel === CHANNEL_TYPE.EMAIL ? email : mobileNumber;

        const verifyOtpRes = await otpService.verifyOTP(channelId, otp);

        if (!verifyOtpRes.success) {
            return HttpResponse.error(res, { message: verifyOtpRes.message, statusCode: verifyOtpRes.statusCode });
        }

        let redirectRoute = REDIRECT_ROUTES.DASHBOARD.DASHBOARD;
        if (!company.is_email_verified || !company.is_phone_verified) {
            redirectRoute = REDIRECT_ROUTES.REGISTRATION.VERIFY_COMPANY_ACCOUNT;
        } else if (!company.is_kyc_verified) {
            redirectRoute = REDIRECT_ROUTES.REGISTRATION.PENDING_KYC_APPROVAL;
        } else {
            redirectRoute = REDIRECT_ROUTES.DASHBOARD.DASHBOARD;
        }


        return HttpResponse.success(res, { message: OTP_MESSAGES.OTP_VERIFY_SUCCESS, data: { redirectRoute: redirectRoute, isEmailVerified: company.is_email_verified, isPhoneVerified: company.is_phone_verified, isKycVerified: company.is_kyc_verified }, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: OTP_MESSAGES.OTP_VERIFICATION_FAILED, statusCode: 500 });
    }
};

module.exports = {
    companyRegistration,
    verifyOtp,
    resendOtp,
    updateAccessToken,
    login,
    triggerOtp,
    verifyMfaOtp
};
