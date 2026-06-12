'use strict';
const ServiceResponse = require('../utils/ServiceResponse');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const { errorLogger } = require('../configs/logger');
const { AUTH_MESSAGES } = require('../utils/constant');


/**
* Generates a pair of access and refresh tokens.
*/
const generateTokens = async (company, role, user) => {
    try {

        const payload = {
            companyId: company.id,
            email: company.company_email,
            companyName: company.company_name,
            mobileNumber: company.mobile_number,
            countryCode: company.country_code,
            role: role.role_code,
            roleId: role.id,
            userId: user.id,
            userName: user?.first_name
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
    refreshToken
};
