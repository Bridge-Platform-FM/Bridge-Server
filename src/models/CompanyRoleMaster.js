'use strict';

const { DataTypes } = require('sequelize');
 
module.exports = (sequelize) => {
    const CompanyRoleMaster = sequelize.define('CompanyRoleMaster', {

        role_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updated_at_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'company_role_master'
    });

    return CompanyRoleMaster;
};
 