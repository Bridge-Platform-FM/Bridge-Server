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

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at'
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }

    }, {

        tableName: 'company_role',
        timestamps: false,
        initialAutoIncrement: 1,
        createdAt: 'created_at',
        updatedAt: 'updated_at'

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