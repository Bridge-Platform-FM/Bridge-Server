'use strict';

const { errorLogger } = require('../configs/logger');
const { AUTH_MESSAGES, TOKEN_TYPES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');
const { verifyAccessToken } = require('../utils/token');
const { readToken, COOKIE_NAMES } = require('../utils/cookies');

/**
 * Middleware for the MFA step (trigger/verify/resend OTP).
 *
 * Accepts ONLY the short-lived MFA-pending token issued at login. It never
 * accepts a full access token, and the MFA-pending token can never satisfy
 * authMiddleware — so business routes stay locked until OTP is verified.
 *
 * No session lookup here: the session record is only created once OTP
 * verification succeeds (see tokenService.generateTokens).
 */
const mfaMiddleware = (req, res, next) => {
    try {
        // Prefer the httpOnly MFA cookie; fall back to the Authorization header.
        const token = readToken(req, COOKIE_NAMES.MFA);

        if (!token) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.ACCESS_TOKEN_UNAUTHORIZED,
                statusCode: 401
            });
        }

        const decoded = verifyAccessToken(token, TOKEN_TYPES.MFA_PENDING_TOKEN);

        if (decoded.type !== TOKEN_TYPES.MFA_PENDING_TOKEN) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 401
            });
        }

        // Attach the identity the OTP controllers need (user + admin portals)
        req.companyId = decoded.companyId;
        req.companyName = decoded.companyName;
        req.email = decoded.email;
        req.mobileNumber = decoded.mobileNumber;
        req.countryCode = decoded.countryCode;
        req.userId = decoded.userId;
        req.roleId = decoded.roleId;
        req.role = decoded.role;
        req.adminId = decoded.adminId;

        next();

    } catch (error) {

        errorLogger.error(error);

        if (error.name === 'TokenExpiredError') {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.ACCESS_TOKEN_EXPIRED,
                statusCode: 401
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 401
            });
        }

        return HttpResponse.error(res, {
            message: AUTH_MESSAGES.UNAUTHORIZED,
            statusCode: 500
        });
    }
};

module.exports = mfaMiddleware;
