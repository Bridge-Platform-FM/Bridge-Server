'use strict';
const jwt = require('jsonwebtoken');
const env = require('../configs/env_configs');

/**
 * Generates a JWT access token.
 * @param {object} payload - Payloads like companyId, role, etc.
 * @returns {string} Signed JWT token
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
        expiresIn: env.JWT.ACCESS_EXPIRY
    });
};

module.exports = generateAccessToken;
