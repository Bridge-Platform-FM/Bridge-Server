// required for migrations

module.exports = {
    development: {
        username: process.env.DB_USER, 
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_NAME, 
        host: process.env.DB_HOST, 
        dialect: process.env.DB_DILECT, 
        port: process.env.DB_PORT,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
};