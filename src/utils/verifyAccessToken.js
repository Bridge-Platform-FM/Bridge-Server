'use strict';
const jwt = require('jsonwebtoken');
const env = require('../configs/env_configs');

/**
 * Verifies a JWT access token.
 * @param {string} token - The access token
 * @returns {object} The decoded payload
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT.ACCESS_SECRET);
};

module.exports = verifyAccessToken;
