'use strict';

const redis = require('../configs/redis');
const permissionRepository = require('../repositories/permissionRepository');
const { errorLogger } = require('../configs/logger');

const CACHE_PREFIX = 'role_permissions:';

const cacheKeyFor = (userType) => `${CACHE_PREFIX}${userType}`;

/**
 * Loads the full userType -> permission mapping from the database into Redis,
 * grouped by user_type. Run once Redis connects so hasPermission() serves
 * every request from Redis, never the database.
 */
const loadAllRolePermissionsIntoCache = async () => {
    const grants = await permissionRepository.getAllRolePermissions();

    const permissionsByUserType = {};
    grants.forEach((grant) => {
        if (!permissionsByUserType[grant.user_type]) {
            permissionsByUserType[grant.user_type] = [];
        }
        permissionsByUserType[grant.user_type].push(grant.permission_key);
    });

    const pipeline = redis.pipeline();
    Object.keys(permissionsByUserType).forEach((userType) => {
        pipeline.set(cacheKeyFor(userType), JSON.stringify(permissionsByUserType[userType]));
    });
    await pipeline.exec();

    console.info(`Loaded permissions for ${Object.keys(permissionsByUserType).length} roles into Redis.`);
};

const getPermissionKeysForUserType = async (userType) => {
    const cached = await redis.get(cacheKeyFor(userType));
    return cached ? JSON.parse(cached) : [];
};

const hasPermission = async (userType, permissionKey) => {
    if (!userType || !permissionKey) {
        return false;
    }

    const permissionKeys = await getPermissionKeysForUserType(userType);
    return permissionKeys.includes(permissionKey);
};

const invalidateUserTypeCache = async (userType) => {
    try {
        await redis.del(cacheKeyFor(userType));
    } catch (error) {
        errorLogger.error(error);
    }
};

module.exports = {
    loadAllRolePermissionsIntoCache,
    hasPermission,
    invalidateUserTypeCache
};
