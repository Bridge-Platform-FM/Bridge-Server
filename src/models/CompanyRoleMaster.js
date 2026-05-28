'use strict';

const { DataTypes } = require('sequelize');
const TimestampFields = require('./base/TimestampFields');
const SoftDeleteFields = require('./base/SoftDeleteFields');

module.exports = (sequelize) => {
    const CompanyRoleMaster = sequelize.define('CompanyRoleMaster', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id'
        },
        role_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role_description: {
            type: DataTypes.STRING,
            allowNull: true
        },

        ...TimestampFields,
        ...SoftDeleteFields
    }, {
        tableName: 'company_role_master',
        timestamps: false,
        initialAutoIncrement: 1
    });

    CompanyRoleMaster.associate = (models) => {
        CompanyRoleMaster.belongsTo(models.Admin, {
            foreignKey: 'created_by',
            as: 'createdBy'
        });

        CompanyRoleMaster.hasMany(models.CompanyRole, {
            foreignKey: 'role_id',
            as: 'companyRoles'
        });

        CompanyRoleMaster.hasMany(models.SubRoleMaster, {
            foreignKey: 'role_id',
            as: 'subRoles'
        });
    };

    return CompanyRoleMaster;
};