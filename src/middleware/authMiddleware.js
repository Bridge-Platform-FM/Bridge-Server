'use strict';
const { errorLogger } = require('../configs/logger');
const { AUTH_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');
const { verifyAccessToken } = require('../utils/token');

/**
 * Middleware to authenticate requests via JWT access token.
 */
const authMiddleware = (req, res, next) => {
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

        // Attach decoded payload to request object
        req.companyId = decoded.companyId;
        req.companyName = decoded.companyName;
        req.email = decoded.email;
        req.mobileNumber = decoded.mobileNumber;
        req.coutryCode = decoded.coutryCode;
        req.userId = decoded.userId
        req.roleId = decoded.roleId
        req.role = decoded.role;
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
