'use strict';

const { DataTypes } = require('sequelize');
 
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
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP') 
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'admin',
                key: 'id'
            }
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
        tableName: 'company_role_master',
        timestamps: false,
        initialAutoIncrement: 1
    });

    CompanyRoleMaster.associate = (models) => {
        CompanyRoleMaster.belongsTo(models.Admin, {
            foreignKey: 'created_by',
            as: 'createdBy'
        });
    };
    
    return CompanyRoleMaster;
};