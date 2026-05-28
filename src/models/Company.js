'use strict';

const { DataTypes } = require('sequelize');
const TimestampFields = require('./base/TimestampFields');
const SoftDeleteFields = require('./base/SoftDeleteFields');

module.exports = (sequelize) => {

    const Company = sequelize.define('Company', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id'
        },

        company_name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        company_email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        mobile_number: {
            type: DataTypes.STRING,
            allowNull: false
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        gst_number: {
            type: DataTypes.STRING,
            allowNull: true
        },

        cin_number: {
            type: DataTypes.STRING,
            allowNull: true
        },

        terms_accepted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        is_mobile_number_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        is_email_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        is_gst_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        is_cin_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        ...TimestampFields,
        ...SoftDeleteFields

    }, {

        tableName: 'company',
        timestamps: false,
        initialAutoIncrement: 1

    });

    Company.associate = (models) => {

        Company.hasMany(models.CompanyRole, {
            foreignKey: 'company_id',
            as: 'companyRoles'
        });

        Company.hasMany(models.User, {
            foreignKey: 'company_id',
            as: 'users'
        });

    };

    return Company;
};