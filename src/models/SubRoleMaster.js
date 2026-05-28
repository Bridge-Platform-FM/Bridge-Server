'use strict';

const { DataTypes } = require('sequelize');
const TimestampFields = require('./base/TimestampFields');
const SoftDeleteFields = require('./base/SoftDeleteFields');

module.exports = (sequelize) => {
    const SubRoleMaster = sequelize.define('SubRoleMaster', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id'
        },
        sub_role_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sub_role_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        sub_role_description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'company_role_id',
            references: {
                model: 'company_role_master',
                key: 'id'
            }
        },
        // company_role_id: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: 'company_role_master', // Must match the tableName of CompanyRoleMaster
        //         key: 'id'
        //     }
        // },

        ...TimestampFields,
        ...SoftDeleteFields

    }, {
        tableName: 'sub_role_master',
        timestamps: false, // Disables default id, createdAt, and updatedAt injections
        initialAutoIncrement: 1
    });

    // Define relationship
    SubRoleMaster.associate = (models) => {

        // SubRoleMaster.belongsTo(models.CompanyRoleMaster, {
        //     foreignKey: 'company_role_id',
        //     as: 'companyRole'
        // });

        SubRoleMaster.belongsTo(models.Admin, {
            foreignKey: 'created_by',
            as: 'createdBy'
        });

        SubRoleMaster.belongsTo(models.CompanyRoleMaster, {
            foreignKey: 'role_id',
            as: 'role'
        });
    };

    return SubRoleMaster;
};