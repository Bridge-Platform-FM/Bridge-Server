'use strict';
const { Admin } = require('../models');

const findByEmail = async (email) => {
    return await Admin.findOne({
        where: { email, is_deleted: false }
    });
};

module.exports = { findByEmail };
