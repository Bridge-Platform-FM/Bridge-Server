'use strict';
const { errorLogger } = require('../configs/logger');
const authService = require('../services/authService');
const otpService = require('../services/otp.service');
const tokenService = require('../services/tokenService');
const userRepository = require('../repositories/userRepository');
const { OTP_MESSAGES, AUTH_MESSAGES, CHANNEL_TYPE, REGISTRATION_MESSAGES, USER_MESSAGES, LOGIN_MESSAGES, REDIRECT_ROUTES, TOKEN_TYPES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');
const { maskPhone, maskEmail } = require('../utils/Helper');
const { generateAccessToken } = require('../utils/token');
const { setAuthCookies, setAccessCookie, setMfaCookie, clearMfaCookie, setResetCookie, clearAuthCookies, getCookie, COOKIE_NAMES } = require('../utils/cookies');

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


        const tokens = await tokenService.generateTokens(companyObj, roleObj, userObj,
            {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            }
        );
        const { accessToken, refreshToken } = tokens.data;

        setAuthCookies(res, { accessToken, refreshToken });

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

        const user = await userRepository.findByEmail(req.email);
        const first_name = user?.first_name ?? null;
        const last_name = user?.last_name ?? null;
        const role = req.role ?? null;

        // If both channels verified, send status to client to enable continue button
        if (statusResult.success) {
            const companyData = statusResult.data;
            if (companyData.is_email_verified && companyData.is_mobile_number_verified) {
                return HttpResponse.success(res, {
                    message: OTP_MESSAGES.OTP_VERIFY_SUCCESS,
                    data: { bothChannelsVerified: true, first_name, last_name, role },
                    statusCode: 200
                });
            }
        }

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
        // The refresh token rides in an httpOnly cookie (browser sends it
        // automatically); fall back to the body for un-migrated clients.
        const refreshToken = getCookie(req, COOKIE_NAMES.REFRESH) || req.body.refreshToken;
        const result = await tokenService.refreshToken(refreshToken);

        if (!result.success) {
            return HttpResponse.error(res, {
                message: result.message,
                statusCode: 401
            });
        }

        // Rotate the access-token cookie with the freshly minted token.
        if (result.data && result.data.accessToken) {
            setAccessCookie(res, result.data.accessToken);
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

        /*
         * MFA gate: login issues ONLY a short-lived MFA-pending token. The real
         * access/refresh tokens are minted after OTP verification (verifyMfaOtp).
         * This token authorizes nothing except the /mfa/* OTP endpoints.
         */
        const mfaToken = generateAccessToken({
            companyId: existingCompany.id,
            email: existingCompany.company_email,
            companyName: existingCompany.company_name,
            mobileNumber: existingCompany.mobile_number,
            countryCode: existingCompany.country_code,
            role: role.role_code,
            roleId: role.id,
            userId: existingUser.id,
            userName: existingUser?.first_name
        }, TOKEN_TYPES.MFA_PENDING_TOKEN);

        // Deliver the MFA-pending token as an httpOnly cookie (the /mfa/* endpoints
        // read it). Still returned in the body as a fallback for un-migrated clients.
        setMfaCookie(res, mfaToken);

        return HttpResponse.success( res, {data: { mfaToken, role: role.role_code, maskedMobile, maskedEmail }, message: LOGIN_MESSAGES.VALID_CREDENTIALS })
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

        /*
         * OTP passed — now (and only now) mint the real access/refresh token
         * pair (stamped mfaVerified:true) and create the session record.
         */
        const companyUserRoleRes = await authService.getCompanyUser_role(company.id, user.id);
        if (!companyUserRoleRes) {
            return HttpResponse.error(res, {
                message: LOGIN_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 400
            });
        }
        const role = companyUserRoleRes.data;

        const tokens = await tokenService.generateTokens(company, role, user, {
            ipAddress: req.ip,
            headers: req.headers          // full headers — parseDeviceInfo reads sec-ch-ua* from these
        });
        const { accessToken, refreshToken } = tokens.data;

        // Real tokens now live in httpOnly cookies; drop the spent MFA cookie.
        setAuthCookies(res, { accessToken, refreshToken });
        clearMfaCookie(res);

        let redirectRoute = REDIRECT_ROUTES.DASHBOARD.DASHBOARD;
        if (!company.is_email_verified || !company.is_mobile_number_verified) {
            redirectRoute = REDIRECT_ROUTES.REGISTRATION.VERIFY_COMPANY_ACCOUNT;
        } else if (!company.is_kyc_verified) {
            redirectRoute = REDIRECT_ROUTES.REGISTRATION.PENDING_KYC_APPROVAL;
        } else {
            redirectRoute = REDIRECT_ROUTES.DASHBOARD.DASHBOARD;
        }

        // userId is echoed so the client can drive "mine vs theirs" UI without
        // decoding the (now httpOnly, JS-unreadable) access token.
        return HttpResponse.success(res, { message: OTP_MESSAGES.OTP_VERIFY_SUCCESS, data: { accessToken, refreshToken, userId: user.id, role: role.role_code, redirectRoute: redirectRoute, isEmailVerified: company.is_email_verified, isPhoneVerified: company.is_phone_verified, isKycVerified: company.is_kyc_verified, first_name: user.first_name, last_name: user.last_name }, statusCode: 200 });
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

        // Deliver the short-lived reset token as an httpOnly cookie (resetPasswordMiddleware reads it).
        setResetCookie(res, accessToken);

        return HttpResponse.success(res, { data: { accessToken }, message: OTP_MESSAGES.OTP_VERIFY_SUCCESS, statusCode: 200 });
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

        // Password changed — invalidate the reset cookie (and any stale auth cookies).
        clearAuthCookies(res);

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
