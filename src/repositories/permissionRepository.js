'use strict';

const { RolePermissionMap, PermissionMaster } = require('../models');

const getPermissionKeysForRole = async (roleCode) => {
    const grants = await RolePermissionMap.findAll({
        where: { role_code: roleCode, is_deleted: false },
        include: [{
            model: PermissionMaster,
            as: 'permission',
            attributes: ['permission_key'],
            where: { is_deleted: false }
        }],
        attributes: []
    });

    return grants.map((grant) => grant.permission.permission_key);
};

/**
 * Fetches every active role -> permission grant, for bulk-loading the
 * full mapping (e.g. into Redis at startup).
 */
const getAllRolePermissions = async () => {
    const grants = await RolePermissionMap.findAll({
        where: { is_deleted: false },
        include: [{
            model: PermissionMaster,
            as: 'permission',
            attributes: ['permission_key'],
            where: { is_deleted: false }
        }],
        attributes: ['role_code']
    });

    return grants.map((grant) => ({
        role_code: grant.role_code,
        permission_key: grant.permission.permission_key
    }));
};

module.exports = {
    getPermissionKeysForRole,
    getAllRolePermissions
};
