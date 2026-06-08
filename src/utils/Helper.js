'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

// Generates a random 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Hash password using bcrypt
const hashPassword = async (password) => {
    const saltRounds = process.env.HASH_SALT_ROUNDS || 10;
    return await bcrypt.hash(password, Number(saltRounds));
};

// watermark data
const waterMarkFunction = (company_id, user_id) => {
    const date = new Date().toISOString().split('T')[0]
    return `Bridge |${company_id} | ${user_id} | ${date}`
}

module.exports = {
    generateOTP,
    hashPassword,
    waterMarkFunction
};
