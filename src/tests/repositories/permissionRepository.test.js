'use strict';

jest.mock('../../models', () => ({
    RolePermissionMap: { findAll: jest.fn() },
    PermissionMaster: {}
}));

const { RolePermissionMap } = require('../../models');
const permissionRepository = require('../../repositories/permissionRepository');

describe('permissionRepository.getPermissionKeysForRole', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns the permission_key of every active grant for the role', async () => {
        RolePermissionMap.findAll.mockResolvedValue([
            { permission: { permission_key: 'DEAL_ROOM.CLOSE' } },
            { permission: { permission_key: 'DEAL_ROOM.VIEW_LIST' } }
        ]);

        const result = await permissionRepository.getPermissionKeysForRole('STARTUP');

        expect(result).toEqual(['DEAL_ROOM.CLOSE', 'DEAL_ROOM.VIEW_LIST']);
        expect(RolePermissionMap.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { role_code: 'STARTUP', is_deleted: false }
            })
        );
    });

    test('returns an empty array when the role has no grants', async () => {
        RolePermissionMap.findAll.mockResolvedValue([]);

        const result = await permissionRepository.getPermissionKeysForRole('UNKNOWN');

        expect(result).toEqual([]);
    });
});

describe('permissionRepository.getAllRolePermissions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns role_code paired with permission_key for every active grant', async () => {
        RolePermissionMap.findAll.mockResolvedValue([
            { role_code: 'STARTUP', permission: { permission_key: 'DEAL_ROOM.CLOSE' } },
            { role_code: 'ADMIN', permission: { permission_key: 'ADMIN_USER.LIST' } }
        ]);

        const result = await permissionRepository.getAllRolePermissions();

        expect(result).toEqual([
            { role_code: 'STARTUP', permission_key: 'DEAL_ROOM.CLOSE' },
            { role_code: 'ADMIN', permission_key: 'ADMIN_USER.LIST' }
        ]);
        expect(RolePermissionMap.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { is_deleted: false }
            })
        );
    });
});
