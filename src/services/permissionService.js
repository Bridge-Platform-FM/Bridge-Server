'use strict';

const redis = require('../configs/redis');
const permissionRepository = require('../repositories/permissionRepository');
const { errorLogger } = require('../configs/logger');

const CACHE_PREFIX = 'role_permissions:';
const CACHE_TTL_SECONDS = 60;

const cacheKeyFor = (roleCode) => `${CACHE_PREFIX}${roleCode}`;

const getPermissionKeysForRole = async (roleCode) => {
    try {
        const cached = await redis.get(cacheKeyFor(roleCode));
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        errorLogger.error(error);
    }

    const permissionKeys = await permissionRepository.getPermissionKeysForRole(roleCode);

    try {
        await redis.set(cacheKeyFor(roleCode), JSON.stringify(permissionKeys), 'EX', CACHE_TTL_SECONDS);
    } catch (error) {
        errorLogger.error(error);
    }

    return permissionKeys;
};

const hasPermission = async (roleCode, permissionKey) => {
    if (!roleCode || !permissionKey) {
        return false;
    }

    const permissionKeys = await getPermissionKeysForRole(roleCode);
    return permissionKeys.includes(permissionKey);
};

const invalidateRoleCache = async (roleCode) => {
    try {
        await redis.del(cacheKeyFor(roleCode));
    } catch (error) {
        errorLogger.error(error);
    }
};

module.exports = {
    hasPermission,
    invalidateRoleCache
};
