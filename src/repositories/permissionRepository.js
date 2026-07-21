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

module.exports = {
    getPermissionKeysForRole
};
