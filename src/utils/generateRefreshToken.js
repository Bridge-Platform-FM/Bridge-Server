'use strict';
const jwt = require('jsonwebtoken');
const env = require('../configs/env_configs');

/**
 * Generates a JWT refresh token.
 * @param {object} payload - Payloads like companyId
 * @returns {string} Signed JWT token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.JWT.REFRESH_SECRET, {
        expiresIn: env.JWT.REFRESH_EXPIRY
    });
};

module.exports = generateRefreshToken;
