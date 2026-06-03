'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const UserCompany = sequelize.define('UserCompany', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            }
        },

        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company',
                key: 'id'
            }
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
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
        tableName: 'user_company',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    UserCompany.associate = (models) => {

        UserCompany.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        UserCompany.belongsTo(models.Company, {
            foreignKey: 'company_id',
            as: 'company'
        });

    };

    return UserCompany;
};