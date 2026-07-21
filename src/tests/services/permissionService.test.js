'use strict';

jest.mock('../../configs/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
}));

jest.mock('../../repositories/permissionRepository', () => ({
    getPermissionKeysForRole: jest.fn()
}));

jest.mock('../../configs/logger', () => ({
    errorLogger: { error: jest.fn() }
}));

const redis = require('../../configs/redis');
const permissionRepository = require('../../repositories/permissionRepository');
const permissionService = require('../../services/permissionService');

describe('permissionService.hasPermission', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns false when roleCode or permissionKey is missing', async () => {
        expect(await permissionService.hasPermission(null, 'DEAL_ROOM.CLOSE')).toBe(false);
        expect(await permissionService.hasPermission('STARTUP', null)).toBe(false);
        expect(permissionRepository.getPermissionKeysForRole).not.toHaveBeenCalled();
    });

    test('returns true when the cache already has the permission for the role', async () => {
        redis.get.mockResolvedValue(JSON.stringify(['DEAL_ROOM.CLOSE']));

        const result = await permissionService.hasPermission('STARTUP', 'DEAL_ROOM.CLOSE');

        expect(result).toBe(true);
        expect(permissionRepository.getPermissionKeysForRole).not.toHaveBeenCalled();
    });

    test('falls back to the repository on a cache miss and populates the cache', async () => {
        redis.get.mockResolvedValue(null);
        permissionRepository.getPermissionKeysForRole.mockResolvedValue(['DEAL_ROOM.CLOSE']);

        const result = await permissionService.hasPermission('STARTUP', 'DEAL_ROOM.CLOSE');

        expect(result).toBe(true);
        expect(permissionRepository.getPermissionKeysForRole).toHaveBeenCalledWith('STARTUP');
        expect(redis.set).toHaveBeenCalledWith(
            'role_permissions:STARTUP',
            JSON.stringify(['DEAL_ROOM.CLOSE']),
            'EX',
            60
        );
    });

    test('falls back to the repository when redis itself errors', async () => {
        redis.get.mockRejectedValue(new Error('connection refused'));
        permissionRepository.getPermissionKeysForRole.mockResolvedValue(['DEAL_ROOM.CLOSE']);

        const result = await permissionService.hasPermission('STARTUP', 'DEAL_ROOM.CLOSE');

        expect(result).toBe(true);
    });

    test('returns false when the role does not have the requested permission', async () => {
        redis.get.mockResolvedValue(JSON.stringify(['DEAL_ROOM.VIEW_LIST']));

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
