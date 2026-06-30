'use strict';
const { sequelize } = require('../models');
const userSessionRepository = require('../repositories/userSessionRepository');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { SESSION_MESSAGES } = require('../utils/constant'); // <-- add this block to utils/constant.js, see note below

/**
 * Used by GET /sessions.
 * `currentJti` is whatever the controller pulled off the validated request
 * (e.g. req.user.jti / req.userJti — depends how your authMiddleware.js
 * exposes it) so we can flag which row is "this device".
 */
const getActiveSessions = async (userId, currentJti) => {
    try {
        const sessions = await userSessionRepository.getActiveSessionsByUser(userId);

        const data = sessions.map((session) => ({
            id: session.id,
            deviceName: session.device_name,
            browser: session.browser,
            os: session.os,
            ipAddress: session.ip_address,
            lastActivityAt: session.last_activity_at,
            createdAt: session.created_at,
            current: session.token_jti === currentJti
        }));

        return ServiceResponse.success({
            message: SESSION_MESSAGES.SESSION_LISTING_SUCCESS,
            data,
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: SESSION_MESSAGES.SESSION_LISTING_FAILED,
            data: [],
            statusCode: 500
        });
    }
};

// Used by DELETE /sessions/:sessionId.
const revokeSession = async (userId, sessionId) => {
    try {
        const session = await userSessionRepository.revokeSessionById(userId, sessionId);

        if (!session) {
            // Covers both "doesn't exist" and "belongs to another user" —
            // deliberately not distinguished in the response.
            return ServiceResponse.error({
                message: SESSION_MESSAGES.SESSION_NOT_FOUND,
                statusCode: 404
            });
        }

        return ServiceResponse.success({
            message: SESSION_MESSAGES.SESSION_REVOKE_SUCCESS,
            data: { id: session.id },
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: SESSION_MESSAGES.SESSION_REVOKE_FAILED,
            statusCode: 500
        });
    }
};

// Used by POST /sessions/logout-all.
const logoutAllSessions = async (userId) => {
    try {
        await userSessionRepository.revokeAllSessionsByUser(userId);
        return ServiceResponse.success({
            message: SESSION_MESSAGES.LOGOUT_ALL_SUCCESS,
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: SESSION_MESSAGES.LOGOUT_ALL_FAILED,
            statusCode: 500
        });
    }
};

/**
 * Same effect as logoutAllSessions, called automatically from the password
 * reset/change flow rather than by a user clicking a button. Kept as a
 * separate exported name so that call site reads clearly about *why* it's
 * revoking everything, without duplicating the logic.
 */
const revokeAllSessionsOnPasswordReset = async (userId) => {
    return logoutAllSessions(userId);
};

/**
 * Called from tokenService.generateTokens() at login.
 *
 * Wraps "evict the oldest session if already at the limit" + "create the
 * new session row" in a single transaction — mirrors the
 * sequelize.transaction() pattern in userService.createUserProfile.
 * Without the transaction, a failure between the two steps could leave a
 * user with one fewer active session than they should have, with no
 * replacement created.
 */
const enforceMaxSessionsAndCreate = async (userObj, jti, deviceInfo, ipAddress, expiresAt, maxSessions) => {
    const transaction = await sequelize.transaction();
    try {
        const activeSessions = await userSessionRepository.getActiveSessionsByUser(userObj.id, { transaction });

        if (activeSessions.length >= maxSessions) {
            await userSessionRepository.revokeOldestActiveSession(userObj.id, { transaction });
        }

        const session = await userSessionRepository.createSession(
            userObj, jti, deviceInfo, ipAddress, expiresAt, { transaction }
        );

        await transaction.commit();
        return ServiceResponse.success({
            message: SESSION_MESSAGES.SESSION_CREATE_SUCCESS,
            data: session,
            statusCode: 201
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        errorLogger.error(error);
        return ServiceResponse.error({
            message: SESSION_MESSAGES.SESSION_CREATE_FAILED,
            statusCode: 500
        });
    }
};

module.exports = {
    getActiveSessions,
    revokeSession,
    logoutAllSessions,
    revokeAllSessionsOnPasswordReset,
    enforceMaxSessionsAndCreate
};