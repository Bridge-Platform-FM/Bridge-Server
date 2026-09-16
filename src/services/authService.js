'use strict';
const bcrypt = require('bcrypt');
const { UniqueConstraintError } = require('sequelize');
const { sequelize } = require('../models');
const companyRepository = require('../repositories/companyRepository');
const userRepository = require('../repositories/userRepository');
const tokenService = require('./tokenService');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { hashPassword } = require('../utils/Helper');
const { REGISTRATION_MESSAGES, AUTH_MESSAGES, USER_MESSAGES, KYC_STATUS, LOGIN_LOCKOUT_LIMITS } = require('../utils/constant');


const getCompanyByEmail = async (email) => {
    try {
        const existingEmailUser = await companyRepository.findByEmail(email);
        return ServiceResponse.success({data:existingEmailUser});
    }
    catch (error) {
    console.error('getUserByEmail ERROR:', error);

    return ServiceResponse.error({
        message:'Error occured while checking company email.',
        data:[error.message],
        statusCode:500
    });
}
}

const getUserByEmail = async (email) => {
    try {
        const existingEmailUser = await userRepository.findByEmail(email);
        return ServiceResponse.success({data:existingEmailUser});
    }
    catch (error) {
    console.error('getUserByEmail ERROR:', error);

    return ServiceResponse.error({
        message:'Error occured while checking user email.',
        data:[error.message],
        statusCode:500
    });
}
}


const createCompany = async (data) => {
    const transaction = await sequelize.transaction();
    // console.log("createCompany data: ", data);
    try {
        // TODO:- encyption add
        // TODO:- need to remove termsAccepted
        const companyData = {
            company_name: data.companyName,
            company_email: data.email, 
            country_code: data.countryCode,
            mobile_number: data.phoneNumber,
            password: await hashPassword(data.password),
            gst_number: data?.gstNumber,
            cin_number: data?.cinNumber,
            is_gst_verified: data?.isGstVerified === true,
            is_cin_verified: data?.isCinVerified === true,
            terms_accepted: data.termsAccepted,
            is_email_verified: false,
            is_mobile_number_verified: false,
            created_at: new Date(),
        };
        // TODO: consistant mobile and email id variables
        const company = await companyRepository.createCompany(companyData, transaction);
        const role = await companyRepository.findRoleMasterByCode(data.role);

        const userData = {
            company_email: data.email,
            password: await hashPassword(data.password),
            mobile_number: data.phoneNumber,
            country_code: data.countryCode,
            created_at: new Date()
        };
        const user = await userRepository.createUser(userData, { transaction });

        await companyRepository.createCompanyUserRole(
            {
                company_id: company.id,
                role_id: role.id,
                user_id: user.id,
                is_default_role: true,
                status: KYC_STATUS.APPROVED
            },
            { transaction }
        );
        await transaction.commit();

        return ServiceResponse.success({message: REGISTRATION_MESSAGES.REGISTRATION_SUCCESS, data: { company, role, user }, statusCode: 201});
    }
    catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({message: REGISTRATION_MESSAGES.COMPANY_CREATION_FAILED, data: [], statusCode: 500});
    }
};


/**
 * Verifies channel OTP and triggers automatic final registration if both verified.
 * 
 */

// Service to update channel verified Status
const updateChannelVerifiedStatus = async (channel, company_id) => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Update the respective channel verified status in company table
        let updatedCompany;
        if (channel === 'EMAIL') {
            updatedCompany = await companyRepository.updateEmailVerifiedStatus(company_id, true, {transaction});
        } else if (channel === 'PHONE') {
            updatedCompany = await companyRepository.updatePhoneVerifiedStatus(company_id, true, {transaction});
        } else {
            throw new Error('Invalid channel specified');
        }
        await transaction.commit();
        return ServiceResponse.success({message: 'Channel verification status updated successfully', data: updatedCompany, statusCode: 200});
    } catch (err) {
        await transaction.rollback();
        errorLogger.error(err);
        return ServiceResponse.error({
            message: 'Error encountered.',
            data: []
        });
    }
};


const checkPassword = async (password, hashedPassword) => {
    try {
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        if (!isPasswordValid) {
            return ServiceResponse.error({ message: AUTH_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
        }
        else {
            return ServiceResponse.success({ statusCode: 200 });
        }
    } catch (error) {
        return ServiceResponse.error({ message: AUTH_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
    }
}

const formatLockMessage = (minutes) =>
    `Account locked due to ${LOGIN_LOCKOUT_LIMITS.MAX_FAILED_ATTEMPTS} incorrect password attempts. Please try again after ${minutes} minute${minutes === 1 ? '' : 's'}.`;

// Called on every login attempt before the password is checked. Lazily clears
// a stale lock (locked_until in the past) so the next attempt gets a fresh
// 5-attempt budget instead of re-locking immediately.
const checkLoginLockStatus = async (company) => {
    if (!company.locked_until) {
        return { locked: false };
    }

    const remainingMs = new Date(company.locked_until).getTime() - Date.now();
    if (remainingMs > 0) {
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        return { locked: true, message: formatLockMessage(remainingMinutes) };
    }

    await companyRepository.resetFailedLoginAttempts(company.id);
    return { locked: false };
};

const registerFailedLoginAttempt = async (companyId) => {
    const updated = await companyRepository.incrementFailedLoginAttempts(companyId);

    if (updated.failed_login_attempts < LOGIN_LOCKOUT_LIMITS.MAX_FAILED_ATTEMPTS) {
        return { locked: false };
    }

    const lockedUntil = new Date(Date.now() + LOGIN_LOCKOUT_LIMITS.LOCKOUT_DURATION_MINUTES * 60 * 1000);
    await companyRepository.lockCompanyLogin(companyId, lockedUntil);
    return { locked: true, message: formatLockMessage(LOGIN_LOCKOUT_LIMITS.LOCKOUT_DURATION_MINUTES) };
};

const resetLoginAttempts = async (companyId) => {
    await companyRepository.resetFailedLoginAttempts(companyId);
};

const getCompanyUser_role = async (company_id, user_id) => {
    try {
        const result = await userRepository.getCompanyUser_role(company_id, user_id);
        return ServiceResponse.success({data: result[0]})
    } catch (error) {
        errorLogger.error(error);

        return ServiceResponse.error({
            message: error.message,
            statusCode: 500
    });
}
}


const getUserCompanyRoleByCode = async (userId, companyId, roleCode) => {
    try {
        const roleInfo = await userRepository.getUserCompanyRoleByCode(userId, companyId, roleCode);
        return ServiceResponse.success({ data: roleInfo });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: error.message,
            statusCode: 500
        });
    }
};

const allocateUserCompanyRole = async (userId, companyId, roleCode) => {
    const transaction = await sequelize.transaction();
    try {
        const role = await companyRepository.findRoleMasterByCode(roleCode);
        if (!role) {
            await transaction.rollback();
            return ServiceResponse.error({ message: USER_MESSAGES.ROLE_NOT_FOUND, statusCode: 400 });
        }

        const companyUserRole = await companyRepository.createCompanyUserRole(
            { company_id: companyId, user_id: userId, role_id: role.id, is_default_role: false },
            { transaction }
        );
        await transaction.commit();

        return ServiceResponse.success({
            data: {
                company_user_role_id: companyUserRole.id,
                role_id: role.id,
                company_id: companyId,
                role_name: role.role_name,
                role_code: role.role_code,
                status: companyUserRole.status,
                rejection_reason: companyUserRole.rejection_reason,
                is_profile_completed: companyUserRole.is_profile_completed
            },
            statusCode: 201
        });
    } catch (error) {
        await transaction.rollback();

        // A concurrent request can win the insert race between the existence
        // check in switchRole and this insert; the unique index on
        // (user_id, company_id, role_id) turns that into a constraint error
        // here instead of a duplicate row. Treat it as "already allocated"
        // and hand back the row the other request created.
        if (error instanceof UniqueConstraintError) {
            const existing = await userRepository.getUserCompanyRoleByCode(userId, companyId, roleCode);
            if (existing) {
                return ServiceResponse.success({ data: existing, statusCode: 200 });
            }
        }

        errorLogger.error(error);
        return ServiceResponse.error({ message: error.message, statusCode: 500 });
    }
};

const getCompanyAndUser = async (companyId, userId) => {
    try {
        const [company, user] = await Promise.all([
            companyRepository.getCompanyById(companyId),
            userRepository.getUserById(userId)
        ]);
        return ServiceResponse.success({ data: { company, user } });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: error.message, statusCode: 500 });
    }
};

/**
 * Fetches user_profile_field_master's field list for a role.
 */
const getProfileFieldsConfig = async (roleId) => {
    try {
        const fieldsConfig = await userRepository.getUserProfileFieldsConfig(roleId);
        return ServiceResponse.success({ data: fieldsConfig });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: error.message, statusCode: 500 });
    }
};

/**
 * Validates a fetched field config list against the already-fetched user/company
 * records, splitting into the full field set and the subset that already
 * has a value in those tables. Fails if any is_required field has no value yet.
 */
const validateAvailableProfileFields = (fieldsConfig, user, company) => {
    const isFilled = (value) => value !== null && value !== undefined && value !== '';
 
    // Only is_required fields with no value yet. `fieldName` + `sourceTable` are what
    // the client updates against; `value` is deliberately absent (there isn't one).
    const missingFields = fieldsConfig
        .filter((config) => config.is_required)
        .filter((config) => {
            if (config.source_table === 'user') return !isFilled(user?.[config.field_name]);
            if (config.source_table === 'company') return !isFilled(company?.[config.field_name]);
            return false;
        })
        .map((config) => ({
            fieldName: config.field_name,
            label: config.display_name,
            sourceTable: config.source_table,
            type: config.type,
            isEditable: config.is_editable,
            isRequired: config.is_required
        }));
 
    if (missingFields.length > 0) {
        return ServiceResponse.error({
            message: USER_MESSAGES.PROFILE_NOT_COMPLETED,
            data: { missingFields },
            statusCode: 400
        });
    }
 
    return ServiceResponse.success({});
};

const resetPassword = async (email, newPassword) => {
    const transaction = await sequelize.transaction();
    try {
        const hashedPassword = await hashPassword(newPassword);

        const updatedCompany = await companyRepository.updatePasswordByEmail(email, hashedPassword, { transaction });
        await userRepository.updatePasswordByEmail(email, hashedPassword, { transaction });

        // A locked-out user who proves their identity via OTP-verified reset
        // should not still be blocked by the old lockout when they log back in.
        if (updatedCompany) {
            await companyRepository.resetFailedLoginAttempts(updatedCompany.id, { transaction });
        }

        await transaction.commit();
        return ServiceResponse.success({ message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS, statusCode: 200 });
    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({ message: AUTH_MESSAGES.PASSWORD_RESET_FAILED, statusCode: 500 });
    }
};

module.exports = {
    checkPassword,
    createCompany,
    updateChannelVerifiedStatus,
    getCompanyByEmail,
    getUserByEmail,
    getCompanyUser_role,
    getUserCompanyRoleByCode,
    allocateUserCompanyRole,
    getCompanyAndUser,
    getProfileFieldsConfig,
    validateAvailableProfileFields,
    resetPassword,
    checkLoginLockStatus,
    registerFailedLoginAttempt,
    resetLoginAttempts
};
