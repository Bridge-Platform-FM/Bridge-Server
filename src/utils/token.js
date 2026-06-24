'use strict';
const jwt = require('jsonwebtoken');
const env = require('../configs/env_configs');
const { TOKEN_TYPES } = require('../utils/constant');


const generateAccessToken = (payload, type=TOKEN_TYPES.AUTH_ACCESS_TOKEN) => {
    let ACCESS_SECRET = null;
    let ACCESS_EXPIRY = null;

    if (type === TOKEN_TYPES.RESET_PASSWORD_ACCESS_TOKEN) {
        payload.type = TOKEN_TYPES.RESET_PASSWORD_ACCESS_TOKEN;
        ACCESS_SECRET = env.JWT.RESET_PASSWORD_SECRET;
        ACCESS_EXPIRY = env.JWT.RESET_PASSWORD_EXPIRY;
    }
    else {
        payload.type = TOKEN_TYPES.AUTH_ACCESS_TOKEN;
        ACCESS_SECRET = env.JWT.ACCESS_SECRET;
        ACCESS_EXPIRY = env.JWT.ACCESS_EXPIRY;
    }
     
    return jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRY
    });
};

const generateRefreshToken = (payload, type=TOKEN_TYPES.AUTH_REFRESH_ACCESS_TOKEN) => {
    let REFRESH_SECRET = env.JWT.REFRESH_SECRET;
    let REFRESH_EXPIRY = env.JWT.REFRESH_EXPIRY;

    payload.type = TOKEN_TYPES.AUTH_REFRESH_ACCESS_TOKEN;
    
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRY
    });
};

const verifyAccessToken = (token, type=TOKEN_TYPES.AUTH_ACCESS_TOKEN) => {
    let secret = null;
    if (type === TOKEN_TYPES.RESET_PASSWORD_ACCESS_TOKEN) {
        secret = env.JWT.RESET_PASSWORD_SECRET;
    }
    else if (type === TOKEN_TYPES.AUTH_REFRESH_ACCESS_TOKEN) {
        secret = env.JWT.REFRESH_SECRET;
    }
    else {
        secret = env.JWT.ACCESS_SECRET;
    }
    return jwt.verify(token, secret);
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
