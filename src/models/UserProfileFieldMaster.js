'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const UserProfileFieldMaster = sequelize.define('UserProfileFieldMaster', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company_role_master',
                key: 'id'
            }
        },

        source_table: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        field_name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        display_name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        is_editable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        is_required: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },

        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'string'
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },

        created_by: {
            type: DataTypes.UUID,
            allowNull: true
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        updated_by: {
            type: DataTypes.UUID,
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
            type: DataTypes.UUID,
            allowNull: true
        }

    }, {
        tableName: 'user_profile_field_master',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { unique: true, fields: ['role_id', 'source_table', 'field_name'] }
        ]
    });

    UserProfileFieldMaster.associate = (models) => {
        UserProfileFieldMaster.belongsTo(models.CompanyRoleMaster, {
            foreignKey: 'role_id',
            as: 'role'
        });
    };

    return UserProfileFieldMaster;
};
