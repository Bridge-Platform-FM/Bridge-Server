'use strict';

const { errorLogger } = require('../configs/logger');
const { AUTH_MESSAGES, TOKEN_TYPES, ROLES } = require('../utils/constant'); // TOKEN_TYPES and ROLES kept from develop branch
const HttpResponse = require('../utils/HttpResponse');
const { verifyAccessToken } = require('../utils/token');

const userSessionRepository = require('../repositories/userSessionRepository');
const { SESSION_LIMIT_ENABLED } = require('../configs/sessionConfig');

/**
 * Middleware to authenticate requests via JWT access token.
 */
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.access_token;

        if (!token) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.ACCESS_TOKEN_UNAUTHORIZED,
                statusCode: 401
            });
        }

        const decoded = verifyAccessToken(token);

        if (!decoded.type === TOKEN_TYPES.AUTH_ACCESS_TOKEN) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 401
            });
        }

        if (!ROLES.USER.includes(decoded.role)) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.FORBIDDEN,
                statusCode: 403
            });
        }

        // Attach decoded payload to request object
        req.companyId = decoded.companyId;
        req.companyName = decoded.companyName;
        req.email = decoded.email;
        req.mobileNumber = decoded.mobileNumber;
        req.countryCode = decoded.countryCode;
        req.userId = decoded.userId;
        req.roleId = decoded.roleId;
        req.role = decoded.role;
        req.jti = decoded.jti; // lets controllers flag the current session

        /*
         * New Session Validation
         */
        if (SESSION_LIMIT_ENABLED) {

            const { jti, userId } = decoded;

            if (!jti) {
                return HttpResponse.error(res, {
                    message: AUTH_MESSAGES.UNAUTHORIZED,
                    statusCode: 401
                });
            }

            const session = await userSessionRepository.findSessionByJti(
                jti,
                userId
            );

            if (!session || session.is_revoked) {
                return HttpResponse.error(res, {
                    message: AUTH_MESSAGES.UNAUTHORIZED,
                    statusCode: 401
                });
            }

            if (
                session.expires_at &&
                new Date(session.expires_at) < new Date()
            ) {
                return HttpResponse.error(res, {
                    message: AUTH_MESSAGES.UNAUTHORIZED,
                    statusCode: 401
                });
            }

            req.session = session;

            await userSessionRepository.updateLastActivity(
                userId,
                jti
            );
        }

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

module.exports = authMiddleware;