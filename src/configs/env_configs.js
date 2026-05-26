require('dotenv').config();

const env = {
    SERVER_PORT: process.env.SERVER_PORT,
    DB: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_DILECT: process.env.DB_DILECT,
        DB_DILECT_MODE: process.env.DB_DILECT_MODE
    },
    JWT: {
        ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'jwt_access_secret_key_12345',
        REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_key_12345',
        ACCESS_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        REFRESH_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d'
    },
    OTP: {
        EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
        RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10),
        MAX_RESEND_PER_HOUR: parseInt(process.env.OTP_MAX_RESEND_PER_HOUR || '10', 10),
        MAX_VERIFY_ATTEMPTS: parseInt(process.env.OTP_MAX_VERIFY_ATTEMPTS || '5', 10),
        BLOCK_DURATION_MINUTES: parseInt(process.env.OTP_BLOCK_DURATION_MINUTES || '15', 10)
    }
};

module.exports = env;