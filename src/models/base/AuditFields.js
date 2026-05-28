'use strict';

const { DataTypes } = require('sequelize');

module.exports = {

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

};