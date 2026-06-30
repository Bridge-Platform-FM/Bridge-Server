'use strict';
const { errorLogger } = require('../configs/logger');
const userSessionService = require('../services/userSessionService');
const { SESSION_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');

const getActiveSessions = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentJti = req.jti; // confirmed via authMiddleware.js — see the new req.jti line there

        const sessionsResponse = await userSessionService.getActiveSessions(userId, currentJti);

        if (!sessionsResponse.success) {
            return HttpResponse.error(res, {
                message: sessionsResponse.message,
                data: sessionsResponse.data,
                statusCode: sessionsResponse.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: sessionsResponse.message,
            data: sessionsResponse.data,
            statusCode: sessionsResponse.statusCode
        });
    } catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, { message: SESSION_MESSAGES.SESSION_LISTING_FAILED, statusCode: 500 });
    }
};

const revokeSession = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;

        const revokeResponse = await userSessionService.revokeSession(userId, sessionId);

        if (!revokeResponse.success) {
            return HttpResponse.error(res, {
                message: revokeResponse.message,
                data: revokeResponse.data,
                statusCode: revokeResponse.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: revokeResponse.message,
            data: revokeResponse.data,
            statusCode: revokeResponse.statusCode
        });
    } catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, { message: SESSION_MESSAGES.SESSION_REVOKE_FAILED, statusCode: 500 });
    }
};

const logoutAllSessions = async (req, res, next) => {
    try {
        const userId = req.userId;

        const logoutResponse = await userSessionService.logoutAllSessions(userId);

        if (!logoutResponse.success) {
            return HttpResponse.error(res, {
                message: logoutResponse.message,
                data: logoutResponse.data,
                statusCode: logoutResponse.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: logoutResponse.message,
            data: logoutResponse.data,
            statusCode: logoutResponse.statusCode
        });
    } catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, { message: SESSION_MESSAGES.LOGOUT_ALL_FAILED, statusCode: 500 });
    }
};

module.exports = { getActiveSessions, revokeSession, logoutAllSessions };
