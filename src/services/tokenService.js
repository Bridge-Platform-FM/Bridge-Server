'use strict';
const bcrypt = require('bcrypt');
const env = require('../configs/env_configs');
const tokenRepository = require('../repositories/tokenRepository');
const generateAccessToken = require('../utils/generateAccessToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const verifyRefreshToken = require('../utils/verifyRefreshToken');
const { Company, CompanyRole, CompanyRoleMaster } = require('../models');
const { applicationLogger } = require('../configs/logger');

const createError = (message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

class TokenService {
    /**
     * Generates a pair of access and refresh tokens.
     */
    async generateTokens(company, roleCode) {
        const payload = {
            companyId: company.id,
            email: company.company_email,
            role: roleCode
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken({ companyId: company.id });

        return { accessToken, refreshToken };
    }

    /**
     * Hashes a refresh token and saves it in the database.
     */
    async saveRefreshToken(companyId, refreshToken, { transaction } = {}) {
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
    }

    /**
     * Refreshes an access token using a valid refresh token.
     */
    async refreshToken(plainRefreshToken) {
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

            applicationLogger.info(`TOKEN REFRESH - Success for company ID: ${companyId}`);

            return { accessToken: newAccessToken };
        } catch (error) {
            if (error.status) {
                throw error;
            }
            if (error.name === 'TokenExpiredError') {
                throw createError('Unauthorized: Refresh token has expired', 401);
            }
            if (error.name === 'JsonWebTokenError') {
                throw createError('Unauthorized: Invalid refresh token format', 401);
            }
            throw createError('Unauthorized: Failed to refresh token', 401);
        }
    }
}

module.exports = new TokenService();
