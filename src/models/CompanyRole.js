'use strict';

const { DataTypes } = require('sequelize');
const TimestampFields = require('./base/TimestampFields');
const SoftDeleteFields = require('./base/SoftDeleteFields');

module.exports = (sequelize) => {

    const CompanyRole = sequelize.define('CompanyRole', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id'
        },

        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company',
                key: 'id'
            }
        },

        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company_role_master',
                key: 'id'
            }
        },

        ...TimestampFields,
        ...SoftDeleteFields

    }, {

        tableName: 'company_role',
        timestamps: false,
        initialAutoIncrement: 1

    });

    CompanyRole.associate = (models) => {

        CompanyRole.belongsTo(models.Company, {
            foreignKey: 'company_id',
            as: 'company'
        });

        CompanyRole.belongsTo(models.CompanyRoleMaster, {
            foreignKey: 'role_id',
            as: 'role'
        });

        CompanyRole.hasMany(models.User, {
            foreignKey: 'company_role_id',
            as: 'users'
        });

    };

    return CompanyRole;
};