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
    }
};

module.exports = env;