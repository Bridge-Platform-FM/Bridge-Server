'use strict';
const { errorLogger } = require('../configs/logger');
const { AUTH_MESSAGES, ROLES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');
const { verifyAccessToken } = require('../utils/token');


/**
 * Middleware to authenticate requests via JWT access token.
 */
const adminMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.ACCESS_TOKEN_UNAUTHORIZED,
                statusCode: 401
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        if (!ROLES.ADMIN.includes(decoded.role)) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.FORBIDDEN,
                statusCode: 403
            });
        }

        // Attach decoded payload to request object
        req.email = decoded.email;
        req.mobileNumber = decoded.mobileNumber;
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

module.exports = adminMiddleware;
