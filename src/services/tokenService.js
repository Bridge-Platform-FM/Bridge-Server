'use strict';
const bcrypt = require('bcrypt');
const env = require('../configs/env_configs');
const tokenRepository = require('../repositories/tokenRepository');
const generateAccessToken = require('../utils/generateAccessToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const verifyRefreshToken = require('../utils/verifyRefreshToken');
const { Company, CompanyRole, CompanyRoleMaster } = require('../models');
const ServiceResponse = require('../utils/ServiceResponse');

const createError = (message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return err;
};


/**
* Generates a pair of access and refresh tokens.
*/
const generateTokens = async (company, roleCode) => {
    try {

        const payload = {
            companyId: company.id,
            email: company.company_email,
            role: roleCode
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken({ companyId: company.id });

        return ServiceResponse.success({
            data: { accessToken, refreshToken }
        });
    } catch (err) {
        return ServiceResponse.error({
            message: err.message || 'Error encountered while generating and sending OTP.',
            data: []
        });
    }
};

/**
 * Hashes a refresh token and saves it in the database.
 */
const saveRefreshToken = async (companyId, refreshToken, { transaction } = {}) => {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    // Parse the refresh expiry duration
    const days = parseInt(env.JWT.REFRESH_EXPIRY, 10) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    await tokenRepository.saveRefreshToken({
        companyId,
        token: hashedToken,
        expiresAt
    }, { transaction });
};

/**
 * Refreshes an access token using a valid refresh token.
 */
const refreshToken = async (plainRefreshToken) => {
    try {
        // 1. Verify token signature and expiry
        const decoded = verifyRefreshToken(plainRefreshToken);
        const companyId = decoded.companyId;

        if (!companyId) {
            throw createError('Invalid refresh token payload', 401);
        }

        // 2. Fetch all active refresh tokens for this company
        const activeTokens = await tokenRepository.findActiveTokensByCompanyId(companyId);
        if (!activeTokens || activeTokens.length === 0) {
            throw createError('Unauthorized: Session expired or invalid refresh token', 401);
        }

        // 3. Find matching hashed token
        let matchedTokenRecord = null;
        for (const tokenRecord of activeTokens) {
            const match = await bcrypt.compare(plainRefreshToken, tokenRecord.token);
            if (match) {
                matchedTokenRecord = tokenRecord;
                break;
            }
        }

        if (!matchedTokenRecord) {
            throw createError('Unauthorized: Session expired or invalid refresh token', 401);
        }

        // 4. Fetch company and role details to populate new access token
        const company = await Company.findByPk(companyId);
        if (!company || !company.is_active) {
            throw createError('Unauthorized: Company account is deactivated', 401);
        }

        const companyRole = await CompanyRole.findOne({
            where: { company_id: companyId },
            include: [{ model: CompanyRoleMaster, as: 'role' }]
        });

        const roleCode = companyRole && companyRole.role ? companyRole.role.role_code : 'STARTUP';

        // 5. Generate new access token
        const newAccessToken = generateAccessToken({
            companyId: company.id,
            email: company.company_email,
            role: roleCode
        });


        return ServiceResponse.success({
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (error) {

        if (error.status) {
            return ServiceResponse.error({
                message: error.message,
                data: []
            });
        }

        if (error.name === 'TokenExpiredError') {
            return ServiceResponse.error({
                message: 'Unauthorized: Refresh token has expired',
                data: []
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return ServiceResponse.error({
                message: 'Unauthorized: Invalid refresh token format',
                data: []
            });
        }

        return ServiceResponse.error({
            message: 'Unauthorized: Failed to refresh token',
            data: []
        });
    }
};

module.exports = {
    generateTokens,
    saveRefreshToken,
    refreshToken
};
