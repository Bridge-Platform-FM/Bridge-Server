'use strict';

const { DataTypes } = require('sequelize');

module.exports = {

    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },

    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    }

};