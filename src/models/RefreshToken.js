'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RefreshToken = sequelize.define('RefreshToken', {
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
            field: 'company_id',
            references: {
                model: 'company',
                key: 'id'
            }
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'token'
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'expires_at'
        },
        is_revoked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_revoked'
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
        tableName: 'refresh_token',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    RefreshToken.associate = (models) => {
        RefreshToken.belongsTo(models.Company, {
            foreignKey: 'company_id',
            as: 'company'
        });
    };

    return RefreshToken;
};
