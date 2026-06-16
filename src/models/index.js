'use strict';
 
const fs = require('fs');

const path = require('path');

const Sequelize = require('sequelize');

const basename = path.basename(__filename);

// const env = process.env.NODE_ENV || 'development';

// const config = require(__dirname + '/../config/config.js')[env];
const env_config = require('../configs/env_configs');
 
const db = {};
 
let sequelize;

// if (config.use_env_variable) {
//     sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//     sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

sequelize = new Sequelize(env_config.DB.DB_NAME, env_config.DB.DB_USER, env_config.DB.DB_PASSWORD, {host: env_config.DB.DB_HOST, dialect: env_config.DB.DB_DILECT, logging: false});

// uat
// sequelize = new Sequelize(
//     env_config.DB.DB_NAME, 
//     env_config.DB.DB_USER, 
//     env_config.DB.DB_PASSWORD, 
//     {
//         host: env_config.DB.DB_HOST, 
//         dialect: env_config.DB.DB_DILECT, 
//         logging: false,
//         ssl: true,
//         dialectOptions: {
//             ssl: {
//             require: true,
//             rejectUnauthorized: false
//             }
//         }
//     }
// );

fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;

db.Sequelize = Sequelize;

module.exports = db;