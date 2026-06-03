'use strict';
const jwt = require('jsonwebtoken');
const env = require('../configs/env_configs');


const generateAccessToken = (payload) => {
    return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
        expiresIn: env.JWT.ACCESS_EXPIRY
    });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.JWT.REFRESH_SECRET, {
        expiresIn: env.JWT.REFRESH_EXPIRY
    });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT.ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.JWT.REFRESH_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
