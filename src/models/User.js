'use strict';

const { DataTypes } = require('sequelize');
const TimestampFields = require('./base/TimestampFields');
const SoftDeleteFields = require('./base/SoftDeleteFields');

module.exports = (sequelize) => {

    const User = sequelize.define('User', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company',
                key: 'id'
            }
        },

        company_role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company_role',
                key: 'id'
            }
        },

        sub_role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sub_role_master',
                key: 'id'
            }
        },

        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        profile_photo: {
            type: DataTypes.STRING,
            allowNull: true
        },

        organization_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        short_bio: {
            type: DataTypes.STRING(300),
            allowNull: true
        },

        country: {
            type: DataTypes.STRING,
            allowNull: true
        },

        primary_sector: {
            type: DataTypes.JSON,
            allowNull: true
        },

        linkedin_profile_url: {
            type: DataTypes.STRING,
            allowNull: true
        },

        company_website_url: {
            type: DataTypes.STRING,
            allowNull: true
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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

        tableName: 'user',
        timestamps: true,
        initialAutoIncrement: 1,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    User.associate = (models) => {

        User.belongsTo(models.Company, {
            foreignKey: 'company_id',
            as: 'company'
        });

        User.belongsTo(models.CompanyRole, {
            foreignKey: 'company_role_id',
            as: 'companyRole'
        });

        User.belongsTo(models.SubRoleMaster, {
            foreignKey: 'sub_role_id',
            as: 'subRole'
        });

    };

    return User;
};