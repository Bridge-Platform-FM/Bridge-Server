'use strict';

const { DataTypes } = require('sequelize');

module.exports = {

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

};