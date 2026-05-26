'use strict';

const { DataTypes } = require('sequelize');

module.exports = {

    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    }

};