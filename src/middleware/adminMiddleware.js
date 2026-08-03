'use strict';
const { errorLogger } = require('../configs/logger');
const { AUTH_MESSAGES, TOKEN_TYPES, ADMIN_USER_TYPES, ADMIN_MANAGEMENT_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');
const { verifyAccessToken, COOKIE_NAMES } = require('../utils/token');

const adminManagementRepository = require('../repositories/adminManagementRepository');
const adminSuspensionCacheRepository = require('../repositories/adminSuspensionCacheRepository');
const adminSuspensionHistoryRepository = require('../repositories/adminSuspensionHistoryRepository');

/**
 * Suspension lookup. Normal path is a synchronous, in-memory Map read (no
 * network call at all — see adminSuspensionCacheRepository's in-process mirror
 * of the suspended_admins Redis hash). The only time this falls back to Redis
 * or Postgres is the brief cold-start window before the boot-time hydration
 * (adminSuspensionCacheService.loadSuspendedAdminsIntoCache) has completed, so
 * a suspended admin can never slip through right after a restart either.
 */
const checkAdminSuspension = async (adminId) => {
    if (adminSuspensionCacheRepository.isMemoryHydrated()) {
        return adminSuspensionCacheRepository.getSuspensionFromMemory(adminId);
    }

    try {
        return await adminSuspensionCacheRepository.getSuspension(adminId);
    } catch (error) {
        errorLogger.error('[adminMiddleware] Redis suspension check failed, falling back to DB:', error.message);

        const admin = await adminManagementRepository.findAdminById(adminId);
        if (!admin || !admin.is_admin_suspended) {
            return null;
        }

        const latestHistory = await adminSuspensionHistoryRepository.findLatestByAdminId(adminId);
        return { reason: latestHistory?.suspension_reason ?? null };
    }
};

/**
 * Middleware to authenticate requests via JWT access token.
 */
const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
        if (!token) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.ACCESS_TOKEN_UNAUTHORIZED,
                statusCode: 401
            });
        }
        const decoded = verifyAccessToken(token);

        if (decoded.type !== TOKEN_TYPES.AUTH_ACCESS_TOKEN) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 401
            });
        }

        if (!ADMIN_USER_TYPES.includes(decoded.userType)) {
            return HttpResponse.error(res, {
                message: AUTH_MESSAGES.FORBIDDEN,
                statusCode: 403
            });
        }

        // Per-request suspension check — runs for every decoded admin token.
        const suspension = await checkAdminSuspension(decoded.adminId);

        if (suspension) {
            return HttpResponse.error(res, {
                message: ADMIN_MANAGEMENT_MESSAGES.ACCOUNT_SUSPENDED,
                statusCode: 403,
                data: { is_admin_suspended: true, reason: suspension.reason ?? null }
            });
        }

        // Attach decoded payload to request object
        req.email = decoded.email;
        req.mobileNumber = decoded.mobileNumber;
        req.role = decoded.role;
        req.userType = decoded.userType;
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