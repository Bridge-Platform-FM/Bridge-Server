'use strict';
const bcrypt = require('bcrypt');
const { sequelize } = require('../models');
const adminRepository = require('../repositories/adminRepository');
const userRepository = require('../repositories/userRepository');
const userLimitConfigRepository = require('../repositories/userLimitConfigRepository');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { ADMIN_MESSAGES, USER_LIMIT_CONFIG_MESSAGES, USER_LIMIT_DEFAULTS, ROLES, TOKEN_TYPES } = require('../utils/constant');
const { maskPhone, maskEmail } = require('../utils/Helper');


const login = async (email, password) => {
    try {
        const admin = await adminRepository.findByEmail(email);
        if (!admin) {
            return ServiceResponse.error({ message: ADMIN_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return ServiceResponse.error({ message: ADMIN_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
        }

        /*
         * MFA gate: admin login issues ONLY a short-lived MFA-pending token.
         * The real access/refresh tokens are minted after OTP verification
         * (adminController.verifyMfaOtp). This token authorizes nothing except
         * the admin /auth/mfa/* OTP endpoints.
         */
        const mfaToken = generateAccessToken({
            adminId: admin.id,
            email: admin.email,
            mobileNumber: admin.mobile_number,
            role: admin.role
        }, TOKEN_TYPES.MFA_PENDING_TOKEN);

        const maskedMobile = maskPhone(admin.country_code + admin.mobile_number);
        const maskedEmail = maskEmail(admin.email);

        return ServiceResponse.success({
            message: ADMIN_MESSAGES.LOGIN_SUCCESS,
            data: { mfaToken, maskedMobile, maskedEmail },
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: ADMIN_MESSAGES.LOGIN_FAILED, statusCode: 500 });
    }
};

/**
 * Mint the real admin access/refresh tokens. Called ONLY after MFA OTP has been
 * verified — the tokens carry mfaVerified:true so they satisfy adminMiddleware.
 */
const issueAuthTokens = (admin) => {
    const payload = {
        adminId: admin.id,
        email: admin.email,
        mobileNumber: admin.mobile_number,
        role: admin.role,
        mfaVerified: true
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
};

const findByEmail = async (email) => {
    try {
        const admin = await adminRepository.findByEmail(email);
        return ServiceResponse.success({ data: admin });
    } catch (error) {
        return ServiceResponse.error({ message: 'Error occured while checking email.', data: [], statusCode: 500 });
    }
};

const getUserLimitConfig = async ({ userId, adminRole }) => {
    try {
        // Role check: currently only SYS_ADMIN is permitted.
        // When SUPER_ADMIN is introduced, add it to ROLES.ADMIN in constant.js.
        if (!ROLES.ADMIN.includes(adminRole)) {
            return ServiceResponse.error({
                message: USER_LIMIT_CONFIG_MESSAGES.FORBIDDEN,
                statusCode: 403
            });
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            return ServiceResponse.error({
                message: USER_LIMIT_CONFIG_MESSAGES.USER_NOT_FOUND,
                statusCode: 404
            });
        }

        const config = await userLimitConfigRepository.findByUserId(userId);

        const data = {
            user_id: userId,
            allowed_connections: config?.allowed_connections ?? USER_LIMIT_DEFAULTS.ALLOWED_CONNECTIONS,
            allowed_free_trial_days: config?.allowed_free_trial_days ?? USER_LIMIT_DEFAULTS.ALLOWED_FREE_TRIAL_DAYS,
            allowed_premium_days: config?.allowed_premium_days ?? USER_LIMIT_DEFAULTS.ALLOWED_PREMIUM_DAYS,
            is_custom: !!config
        };

        return ServiceResponse.success({
            message: USER_LIMIT_CONFIG_MESSAGES.FETCH_SUCCESS,
            data,
            statusCode: 200
        });

    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: USER_LIMIT_CONFIG_MESSAGES.FETCH_FAILED,
            statusCode: 500
        });
    }
};

const updateUserLimitConfig = async ({ userId, adminId, adminRole, payload }) => {
    const transaction = await sequelize.transaction();
    try {
        // Role check: currently only SYS_ADMIN is permitted.
        // When SUPER_ADMIN is introduced, add it to ROLES.ADMIN in constant.js.
        if (!ROLES.ADMIN.includes(adminRole)) {
            await transaction.rollback();
            return ServiceResponse.error({
                message: USER_LIMIT_CONFIG_MESSAGES.FORBIDDEN,
                statusCode: 403
            });
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            await transaction.rollback();
            return ServiceResponse.error({
                message: USER_LIMIT_CONFIG_MESSAGES.USER_NOT_FOUND,
                statusCode: 404
            });
        }

        const { allowed_connections, allowed_free_trial_days, allowed_premium_days } = payload;

        const updateData = {};
        if (allowed_connections !== undefined) updateData.allowed_connections = allowed_connections;
        if (allowed_free_trial_days !== undefined) updateData.allowed_free_trial_days = allowed_free_trial_days;
        if (allowed_premium_days !== undefined) updateData.allowed_premium_days = allowed_premium_days;

        const result = await userLimitConfigRepository.upsertUserLimitConfig(userId, updateData, adminId, { transaction });

        await transaction.commit();

        return ServiceResponse.success({
            message: USER_LIMIT_CONFIG_MESSAGES.UPDATE_SUCCESS,
            data: result,
            statusCode: 200
        });

    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({
            message: USER_LIMIT_CONFIG_MESSAGES.UPDATE_FAILED,
            statusCode: 500
        });
    }
};


module.exports = { login, issueAuthTokens, findByEmail, getUserLimitConfig, updateUserLimitConfig };