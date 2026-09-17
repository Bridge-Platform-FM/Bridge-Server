'use strict';

const { UniqueConstraintError } = require('sequelize');

const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

jest.mock('../../models', () => ({
    sequelize: { transaction: jest.fn() }
}));

jest.mock('../../repositories/companyRepository', () => ({
    findRoleMasterByCode: jest.fn(),
    createCompanyUserRole: jest.fn()
}));

jest.mock('../../repositories/userRepository', () => ({
    getUserCompanyRoleByCode: jest.fn()
}));

jest.mock('../../configs/logger', () => ({
    errorLogger: { error: jest.fn() }
}));

// authService pulls in tokenService, which opens a real ioredis connection
// (via sessionCacheRepository) on require — keep this test DB/redis-free.
jest.mock('../../configs/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn()
}));

const { sequelize } = require('../../models');
const companyRepository = require('../../repositories/companyRepository');
const userRepository = require('../../repositories/userRepository');
const authService = require('../../services/authService');

describe('authService.allocateUserCompanyRole', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sequelize.transaction.mockResolvedValue(mockTransaction);
    });

    test('creates a new (non-default) company_user_role row for the switched role', async () => {
        companyRepository.findRoleMasterByCode.mockResolvedValue({ id: 9, role_name: 'Mentor', role_code: 'MENTOR' });
        companyRepository.createCompanyUserRole.mockResolvedValue({
            id: 101, status: 'Pending', rejection_reason: null, is_profile_completed: false
        });

        const result = await authService.allocateUserCompanyRole('user-1', 'company-1', 'mentor');

        expect(companyRepository.createCompanyUserRole).toHaveBeenCalledWith(
            { company_id: 'company-1', user_id: 'user-1', role_id: 9, is_default_role: false },
            { transaction: mockTransaction }
        );
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(result).toEqual(expect.objectContaining({
            success: true,
            statusCode: 201,
            data: expect.objectContaining({ company_user_role_id: 101, role_code: 'MENTOR' })
        }));
    });

    test('returns 400 when the role code does not exist', async () => {
        companyRepository.findRoleMasterByCode.mockResolvedValue(null);

        const result = await authService.allocateUserCompanyRole('user-1', 'company-1', 'bogus');

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(companyRepository.createCompanyUserRole).not.toHaveBeenCalled();
    });

    /*
     * Two concurrent switch-role requests can both pass the "does a row already
     * exist" check in the controller and both reach this insert. The unique
     * index on (user_id, company_id, role_id) makes the loser fail with a
     * UniqueConstraintError instead of creating a duplicate row — this must
     * resolve to the winner's row, not a 500.
     */
    test('treats a UniqueConstraintError as "already allocated" and returns the existing row', async () => {
        companyRepository.findRoleMasterByCode.mockResolvedValue({ id: 9, role_name: 'Mentor', role_code: 'MENTOR' });
        companyRepository.createCompanyUserRole.mockRejectedValue(new UniqueConstraintError({}));
        userRepository.getUserCompanyRoleByCode.mockResolvedValue({
            company_user_role_id: 55, role_id: 9, role_code: 'MENTOR', status: 'Pending'
        });

        const result = await authService.allocateUserCompanyRole('user-1', 'company-1', 'mentor');

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(userRepository.getUserCompanyRoleByCode).toHaveBeenCalledWith('user-1', 'company-1', 'mentor');
        expect(result).toEqual({
            success: true,
            statusCode: 200,
            data: expect.objectContaining({ company_user_role_id: 55 }),
            message: 'Successfully processed.'
        });
    });

    test('still fails with 500 if the concurrent-winner row cannot be found after a UniqueConstraintError', async () => {
        companyRepository.findRoleMasterByCode.mockResolvedValue({ id: 9, role_name: 'Mentor', role_code: 'MENTOR' });
        companyRepository.createCompanyUserRole.mockRejectedValue(new UniqueConstraintError({}));
        userRepository.getUserCompanyRoleByCode.mockResolvedValue(null);

        const result = await authService.allocateUserCompanyRole('user-1', 'company-1', 'mentor');

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(500);
    });
});

describe('authService.validateAvailableProfileFields', () => {
    const user = { first_name: 'Ada', funding_stage: null, use_of_funds: null };
    const company = { gst_number: null };

    test('returns required and optional unfilled registration fields when required ones are missing', () => {
        const fieldsConfig = [
            {
                field_name: 'use_of_funds', display_name: 'Use of Funds', source_table: 'user',
                type: 'string', is_editable: true, is_required: true, is_registration_field: true
            },
            {
                field_name: 'funding_stage', display_name: 'Funding Stage', source_table: 'user',
                type: 'string', is_editable: true, is_required: false, is_registration_field: true
            },
            {
                field_name: 'first_name', display_name: 'First Name', source_table: 'user',
                type: 'string', is_editable: true, is_required: true, is_registration_field: true
            }
        ];

        const result = authService.validateAvailableProfileFields(fieldsConfig, user, company);

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.data.missingFields.map((f) => f.fieldName).sort()).toEqual([
            'funding_stage',
            'use_of_funds'
        ]);
        expect(result.data.missingFields.find((f) => f.fieldName === 'funding_stage').isRequired).toBe(false);
        expect(result.data.missingFields.find((f) => f.fieldName === 'use_of_funds').isRequired).toBe(true);
    });

    test('succeeds when required fields are filled even if optional ones are empty', () => {
        const fieldsConfig = [
            {
                field_name: 'first_name', display_name: 'First Name', source_table: 'user',
                type: 'string', is_editable: true, is_required: true, is_registration_field: true
            },
            {
                field_name: 'funding_stage', display_name: 'Funding Stage', source_table: 'user',
                type: 'string', is_editable: true, is_required: false, is_registration_field: true
            }
        ];

        const result = authService.validateAvailableProfileFields(fieldsConfig, user, company);

        expect(result.success).toBe(true);
    });
});
