'use strict';
const { errorLogger } = require('../configs/logger');
const authService = require('../services/authService');
const otpService = require('../services/otp.service');
const tokenService = require('../services/tokenService');
const userRepository = require('../repositories/userRepository');
const { OTP_MESSAGES, AUTH_MESSAGES, CHANNEL_TYPE, REGISTRATION_MESSAGES, USER_MESSAGES, LOGIN_MESSAGES, REDIRECT_ROUTES, TOKEN_TYPES, USER_TYPES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');
const { maskPhone, maskEmail } = require('../utils/Helper');
const { COOKIE_NAMES, cookieOptions, clearCookieOptions } = require('../utils/token');
const env = require('../configs/env_configs');

/** Cookie options — httpOnly so JS can't read the token. */
const ACCESS_COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,       // 1 day
};
const REFRESH_COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
};

function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTS);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTS);
}

/** Cookie options — httpOnly so JS can't read the token. */
const ACCESS_COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,       // 1 day
};
const REFRESH_COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
};

function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTS);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTS);
}

//  POST /api/v1/auth/company-registration
const companyRegistration = async (req, res, next) => {
    try {
        const { companyName, email, countryCode, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber } = req.body;

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
                message: emailOtpRes.message || OTP_MESSAGES.OTP_SEND_FAILED,
                statusCode: 500
            });
        }
        const phoneOtpRes = await otpService.sendOTP(CHANNEL_TYPE.PHONE, phoneNumber);
        if (!phoneOtpRes.success) {
            return HttpResponse.error(res, {
                message: phoneOtpRes.message || OTP_MESSAGES.OTP_SEND_FAILED,
                statusCode: 500
            });
        }
        
        // remove termsAccepted from payload before saving in db
        const createCompanyRes = await authService.createCompany({ companyName, email, countryCode, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber });
        if (!createCompanyRes.success) {
            return HttpResponse.error(res, { message: createCompanyRes.message, statusCode: createCompanyRes.statusCode });
        }
        
        const companyObj = createCompanyRes.data.company
        const roleObj = createCompanyRes.data.role
        const userObj = createCompanyRes.data.user

        const userType = USER_TYPES[roleObj.role_code];
        const mfaTokenRes = await tokenService.generateMfaAccessToken(companyObj, roleObj, userObj, userType);
        if (!mfaTokenRes.success) {
            return HttpResponse.error(res, { message: mfaTokenRes.message, statusCode: 500 });
        }

        res.cookie(COOKIE_NAMES.MFA_TOKEN, mfaTokenRes.data.accessToken, cookieOptions(env.JWT.MFA_EXPIRY));

        // setAuthCookies(res, accessToken, refreshToken);
        return HttpResponse.success(res, {
            message: OTP_MESSAGES.SUCCESS,
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

        const user = await userRepository.findByEmail(req.email);
        const first_name = user?.first_name ?? null;
        const last_name = user?.last_name ?? null;
        const role = req.role ?? null;

        const companyData = statusResult.data;
        const roleObj = { role_code: req.role, id: req.roleId };

        // If both channels verified, set the full access token; otherwise keep the mfa token
        if (companyData.is_email_verified && companyData.is_mobile_number_verified) {
            const tokens = await tokenService.generateTokens(companyData, roleObj, user, req.userType, {
                ipAddress: req.ip,
                headers: req.headers
            });
            const { accessToken, refreshToken } = tokens.data;

            res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions(env.JWT.ACCESS_EXPIRY));
            res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, cookieOptions(env.JWT.REFRESH_EXPIRY));
            res.clearCookie(COOKIE_NAMES.MFA_TOKEN, clearCookieOptions());

            return HttpResponse.success(res, {
                message: OTP_MESSAGES.OTP_VERIFY_SUCCESS,
                data: { bothChannelsVerified: true, first_name, last_name, role },
                statusCode: 200
            });
        }

        const mfaTokenRes = await tokenService.generateMfaAccessToken(companyData, roleObj, user, req.userType);
        if (!mfaTokenRes.success) {
            return HttpResponse.error(res, { message: mfaTokenRes.message, statusCode: 500 });
        }
        res.cookie(COOKIE_NAMES.MFA_TOKEN, mfaTokenRes.data.accessToken, cookieOptions(env.JWT.MFA_EXPIRY));

        return HttpResponse.success(res, {
            message: OTP_MESSAGES.OTP_VERIFY_SUCCESS,
            data: { first_name, last_name, role },
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
            return HttpResponse.error(res, {
                message: existingCompanyRes.message,
                statusCode: existingCompanyRes.statusCode
            });
        }

        const existingCompany = existingCompanyRes.data;

        if (!existingCompany) {
            return HttpResponse.error(res, {
                message: LOGIN_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 400
            });
        }

        const passwordRes = await authService.checkPassword(
            password,
            existingCompany.password
        );

        if (!passwordRes.success) {
            return HttpResponse.error(res, {
                message: LOGIN_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 400
            });
        }

        const existingUserRes = await authService.getUserByEmail(email);

        if (!existingUserRes.success) {
            return HttpResponse.error(res, {
                message: LOGIN_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 400
            });
        }

        const existingUser = existingUserRes.data;

        const companyUserRoleRes =
            await authService.getCompanyUser_role(
                existingCompany.id,
                existingUser.id
            );

        if (!companyUserRoleRes) {
            return HttpResponse.error(res, {
                message: LOGIN_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 400
            });
        }

        // rest unchanged
        const role = companyUserRoleRes.data;

        const maskedMobile = maskPhone(existingCompany.country_code + existingCompany.mobile_number);
        const maskedEmail = maskEmail(existingCompany.company_email);

        const userType = USER_TYPES[role.role_code];
        const tokens = await tokenService.generateMfaAccessToken(existingCompany, role, existingUser, userType);
        const { accessToken } = tokens.data;

        res.cookie(COOKIE_NAMES.MFA_TOKEN, accessToken, cookieOptions(env.JWT.MFA_EXPIRY));
        return HttpResponse.success( res, {data: { role: role.role_code, maskedMobile, maskedEmail }, message: LOGIN_MESSAGES.VALID_CREDENTIALS })
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

        return HttpResponse.success(res, { message: result.message, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: OTP_MESSAGES.OTP_GENERATION_FAILED, statusCode: 500 });
    }
};

const verifyMfaOtp = async (req, res, next) => {
    try {
        const email = req.email;

        const existingCompanyRes = await authService.getCompanyByEmail(email);
        if (!existingCompanyRes.success) {
            return HttpResponse.error(res, {
                message: existingCompanyRes.message,
                statusCode: existingCompanyRes.statusCode
            });
        }

        const existingUserRes = await authService.getUserByEmail(email);
        if (!existingUserRes.success) {
            return HttpResponse.error(res, {
                message: existingUserRes.message,
                statusCode: existingUserRes.statusCode
            });
        }

        const company = existingCompanyRes.data;
        const mobileNumber = company.mobile_number;
        const user = existingUserRes.data;

        const { otp, channel } = req.body;
        let channelId = channel === CHANNEL_TYPE.EMAIL ? email : mobileNumber;

        const verifyOtpRes = await otpService.verifyOTP(channelId, otp);

        if (!verifyOtpRes.success) {
            return HttpResponse.error(res, { message: verifyOtpRes.message, statusCode: verifyOtpRes.statusCode });
        }

        let redirectRoute = REDIRECT_ROUTES.DASHBOARD.DASHBOARD;
        if (!company.is_email_verified || !company.is_mobile_number_verified) {
            redirectRoute = REDIRECT_ROUTES.REGISTRATION.VERIFY_COMPANY_ACCOUNT;
        } else if (!company.is_kyc_verified) {
            redirectRoute = REDIRECT_ROUTES.REGISTRATION.PENDING_KYC_APPROVAL;
        } else {
            redirectRoute = REDIRECT_ROUTES.DASHBOARD.DASHBOARD;
        }

        
        const role = { role_code: req.role, id: req.roleId };
        const tokens = await tokenService.generateTokens(company, role, user, req.userType, {
            ipAddress: req.ip,
            headers: req.headers          // full headers — parseDeviceInfo reads sec-ch-ua* from these
        });
        const { accessToken, refreshToken } = tokens.data;

        res.clearCookie(COOKIE_NAMES.MFA_TOKEN, clearCookieOptions());
        res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions(env.JWT.ACCESS_EXPIRY));
        res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, cookieOptions(env.JWT.REFRESH_EXPIRY));
        return HttpResponse.success(res, { message: OTP_MESSAGES.OTP_VERIFY_SUCCESS, data: { userId: user.id, tokenType: TOKEN_TYPES.AUTH_ACCESS_TOKEN, redirectRoute: redirectRoute, isEmailVerified: company.is_email_verified, isPhoneVerified: company.is_phone_verified, isKycVerified: company.is_kyc_verified, first_name: user.first_name, last_name: user.last_name }, statusCode: 200 });
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

const resetPasswordTriggerOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existingCompanyRes = await authService.getCompanyByEmail(email);
        if (!existingCompanyRes.success) {
            return HttpResponse.error(res, {
                message: existingCompanyRes.message,
                statusCode: existingCompanyRes.statusCode
            });
        }
        const existingCompany = existingCompanyRes.data;
        if (!existingCompany) {
            return HttpResponse.error(res, {
                message: USER_MESSAGES.USER_NOT_FOUND,
                statusCode: 400
            });
        }

        const result = await otpService.sendOTP(CHANNEL_TYPE.EMAIL, email);
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
}

const resetPasswordVerifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const existingCompanyRes = await authService.getCompanyByEmail(email);
        if (!existingCompanyRes.success) {
            return HttpResponse.error(res, {
                message: existingCompanyRes.message,
                statusCode: existingCompanyRes.statusCode
            });
        }

        const company = existingCompanyRes.data;
        if (!company) {
            return HttpResponse.error(res, {
                message: USER_MESSAGES.USER_NOT_FOUND,
                statusCode: 400
            });
        }

        const tokenRes = await tokenService.generateResetPasswordAcessToken(email);
        if (!tokenRes.success) {
            return HttpResponse.error(res, { message: tokenRes.message, statusCode: tokenRes.statusCode });
        }

        const accessToken = tokenRes.data.accessToken;

        const verifyOtpRes = await otpService.verifyOTP(email, otp);

        if (!verifyOtpRes.success) {
            return HttpResponse.error(res, { message: verifyOtpRes.message, statusCode: verifyOtpRes.statusCode });
        }

        res.cookie(COOKIE_NAMES.RESET_TOKEN, accessToken, cookieOptions(env.JWT.RESET_PASSWORD_EXPIRY));

        return HttpResponse.success(res, { message: OTP_MESSAGES.OTP_VERIFY_SUCCESS, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: OTP_MESSAGES.OTP_VERIFICATION_FAILED, statusCode: 500 });
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const email = req.email;
        const { newPassword } = req.body;

        const existingCompanyRes = await authService.getCompanyByEmail(email);
        if (!existingCompanyRes.success) {
            return HttpResponse.error(res, {
                message: existingCompanyRes.message,
                statusCode: existingCompanyRes.statusCode
            });
        }

        const company = existingCompanyRes.data;
        if (!company) {
            return HttpResponse.error(res, {
                message: USER_MESSAGES.USER_NOT_FOUND,
                statusCode: 400
            });
        }

        const result = await authService.resetPassword(email, newPassword);
        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }
        res.clearCookie(COOKIE_NAMES.RESET_TOKEN, clearCookieOptions());

        return HttpResponse.success(res, { message: result.message, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, { message: AUTH_MESSAGES.PASSWORD_RESET_FAILED, statusCode: 500 });
    }
};

module.exports = {
    companyRegistration,
    verifyOtp,
    resendOtp,
    updateAccessToken,
    login,
    triggerOtp,
    verifyMfaOtp,
    resendMfaOtp,
    resetPasswordTriggerOtp,
    resetPasswordVerifyOtp,
    resetPassword
};