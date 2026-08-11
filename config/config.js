// required for migrations

require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER, 
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_NAME, 
        host: process.env.DB_HOST, 
        dialect: process.env.DB_DILECT, 
        port: process.env.DB_PORT,
        // UAT
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
};