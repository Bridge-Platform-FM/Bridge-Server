'use strict';

const mockPipeline = { set: jest.fn(), exec: jest.fn() };

jest.mock('../../configs/redis', () => ({
    get: jest.fn(),
    del: jest.fn(),
    pipeline: jest.fn()
}));

jest.mock('../../repositories/permissionRepository', () => ({
    getAllRolePermissions: jest.fn()
}));

jest.mock('../../configs/logger', () => ({
    errorLogger: { error: jest.fn() }
}));

const redis = require('../../configs/redis');
const permissionRepository = require('../../repositories/permissionRepository');
const permissionService = require('../../services/permissionService');

describe('permissionService.loadAllRolePermissionsIntoCache', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPipeline.set.mockClear();
        mockPipeline.exec.mockClear();
        redis.pipeline.mockReturnValue(mockPipeline);
    });

    test('groups grants by role_code and writes each role to redis via a pipeline', async () => {
        permissionRepository.getAllRolePermissions.mockResolvedValue([
            { role_code: 'STARTUP', permission_key: 'DEAL_ROOM.CLOSE' },
            { role_code: 'STARTUP', permission_key: 'DEAL_ROOM.VIEW_LIST' },
            { role_code: 'ADMIN', permission_key: 'ADMIN_USER.LIST' }
        ]);

        await permissionService.loadAllRolePermissionsIntoCache();

        expect(mockPipeline.set).toHaveBeenCalledWith(
            'role_permissions:STARTUP',
            JSON.stringify(['DEAL_ROOM.CLOSE', 'DEAL_ROOM.VIEW_LIST'])
        );
        expect(mockPipeline.set).toHaveBeenCalledWith(
            'role_permissions:ADMIN',
            JSON.stringify(['ADMIN_USER.LIST'])
        );
        expect(mockPipeline.exec).toHaveBeenCalled();
    });
});

describe('permissionService.hasPermission', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns false when roleCode or permissionKey is missing', async () => {
        expect(await permissionService.hasPermission(null, 'DEAL_ROOM.CLOSE')).toBe(false);
        expect(await permissionService.hasPermission('STARTUP', null)).toBe(false);
        expect(redis.get).not.toHaveBeenCalled();
    });

    test('returns true when redis has the permission for the role', async () => {
        redis.get.mockResolvedValue(JSON.stringify(['DEAL_ROOM.CLOSE']));

        const result = await permissionService.hasPermission('STARTUP', 'DEAL_ROOM.CLOSE');

        expect(result).toBe(true);
        expect(redis.get).toHaveBeenCalledWith('role_permissions:STARTUP');
    });

    test('returns false when the role does not have the requested permission', async () => {
        redis.get.mockResolvedValue(JSON.stringify(['DEAL_ROOM.VIEW_LIST']));

        const result = await permissionService.hasPermission('STARTUP', 'DEAL_ROOM.CLOSE');

        expect(result).toBe(false);
    });

    test('returns false when redis has no entry for the role, without querying the database', async () => {
        redis.get.mockResolvedValue(null);

        const result = await permissionService.hasPermission('STARTUP', 'DEAL_ROOM.CLOSE');

        expect(result).toBe(false);
    });
});

describe('permissionService.invalidateRoleCache', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deletes the cache entry for the role', async () => {
        await permissionService.invalidateRoleCache('STARTUP');

        expect(redis.del).toHaveBeenCalledWith('role_permissions:STARTUP');
    });
});
