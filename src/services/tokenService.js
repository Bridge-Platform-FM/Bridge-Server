'use strict';
const bcrypt = require('bcrypt');
const env = require('../configs/env_configs');
const tokenRepository = require('../repositories/tokenRepository');
// const generateAccessToken = require('../utils/generateAccessToken');
// const generateRefreshToken = require('../utils/generateRefreshToken');
// const verifyRefreshToken = require('../utils/verifyRefreshToken');
const { Company, CompanyRole, CompanyRoleMaster } = require('../models');
const ServiceResponse = require('../utils/ServiceResponse');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const { errorLogger } = require('../configs/logger');
const { AUTH_MESSAGES } = require('../utils/constant');

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
        const refreshToken = generateRefreshToken(payload);

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

// Saved refresh token in db with company id, ipaddress, device, os, broswer
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
 * create an access token using a valid refresh token.
 */
const refreshToken = async (plainRefreshToken) => {
    try {
        // 1. Verify token signature and expiry
        const decoded = verifyRefreshToken(plainRefreshToken);
        const companyId = decoded.companyId;

        if (!companyId) {
            return ServiceResponse.error({
                message: AUTH_MESSAGES.TOKEN_REFRESH_FAILED,
                statusCode: 401
            });
        }

        const userData = {
            companyId: decoded.companyId,
            email: decoded.email,
            role: decoded.role
        }

        // 2. Create a new access token
        const newAccessToken = await generateAccessToken(userData);

        return ServiceResponse.success({
            message: AUTH_MESSAGES.TOKEN_REFRESH_SUCCESS,
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (error) {
        errorLogger.error(error);
        if (error.name === 'TokenExpiredError') {
            return ServiceResponse.error({
                message: AUTH_MESSAGES.ACCESS_TOKEN_EXPIRED,
                statusCode: 401
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return ServiceResponse.error({
                message: AUTH_MESSAGES.INVALID_CREDENTIALS,
                statusCode: 401
            });
        }
        return ServiceResponse.error({
            message: AUTH_MESSAGES.UNAUTHORIZED,
            statusCode: 500
        });
    }
};

module.exports = {
    generateTokens,
    saveRefreshToken,
    refreshToken
};
