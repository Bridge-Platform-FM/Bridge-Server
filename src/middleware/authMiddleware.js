'use strict';
const verifyAccessToken = require('../utils/verifyAccessToken');

/**
 * Middleware to authenticate requests via JWT access token.
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('Unauthorized: Access token is missing or malformed');
            error.status = 401;
            throw error;
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        // Attach decoded payload to request object
        req.company = decoded;
        next();
    } catch (error) {
        if (error.status) {
            return next(error);
        }
        if (error.name === 'TokenExpiredError') {
            const err = new Error('Unauthorized: Access token has expired');
            err.status = 401;
            return next(err);
        }
        if (error.name === 'JsonWebTokenError') {
            const err = new Error('Unauthorized: Invalid access token');
            err.status = 401;
            return next(err);
        }
        const err = new Error(error.message || 'Unauthorized');
        err.status = 401;
        return next(err);
    }
};

module.exports = authMiddleware;
