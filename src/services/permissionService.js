'use strict';

const redis = require('../configs/redis');
const permissionRepository = require('../repositories/permissionRepository');
const { errorLogger } = require('../configs/logger');

const CACHE_PREFIX = 'role_permissions:';

const cacheKeyFor = (roleCode) => `${CACHE_PREFIX}${roleCode}`;

/**
 * Loads the full role -> permission mapping from the database into Redis,
 * grouped by role_code. Run once Redis connects so hasPermission() serves
 * every request from Redis, never the database.
 */
const loadAllRolePermissionsIntoCache = async () => {
    const grants = await permissionRepository.getAllRolePermissions();

    const permissionsByRole = {};
    grants.forEach((grant) => {
        if (!permissionsByRole[grant.role_code]) {
            permissionsByRole[grant.role_code] = [];
        }
        permissionsByRole[grant.role_code].push(grant.permission_key);
    });

    const pipeline = redis.pipeline();
    Object.keys(permissionsByRole).forEach((roleCode) => {
        pipeline.set(cacheKeyFor(roleCode), JSON.stringify(permissionsByRole[roleCode]));
    });
    await pipeline.exec();

    console.info(`Loaded permissions for ${Object.keys(permissionsByRole).length} roles into Redis.`);
};

const getPermissionKeysForRole = async (roleCode) => {
    const cached = await redis.get(cacheKeyFor(roleCode));
    return cached ? JSON.parse(cached) : [];
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
    loadAllRolePermissionsIntoCache,
    hasPermission,
    invalidateRoleCache
};
