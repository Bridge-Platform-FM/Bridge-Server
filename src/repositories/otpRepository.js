'use strict';
const { OtpVerification } = require('../models');
const { Op } = require('sequelize');

const findByEmail = async (email) => {
    return await OtpVerification.findOne({
        where: { email }
    });
};

const findByPhoneNumber = async (phoneNumber) => {
    return await OtpVerification.findOne({
        where: { phone_number: phoneNumber }
    });
};

const findByEmailOrPhone = async (email, phoneNumber) => {
    return await OtpVerification.findOne({
        where: {
            [Op.or]: [
                { email: email },
                { phone_number: phoneNumber }
            ]
        }
    });
};

const createOtp = async (otpData) => {
    return await OtpVerification.create(otpData);
};

const updateOtp = async (id, otpData) => {
    return await OtpVerification.update(otpData, {
        where: { id },
        returning: true
    });
};

const deleteOtp = async (id, { transaction } = {}) => {
    return await OtpVerification.destroy({
        where: { id },
        transaction
    });
};

module.exports = {
    findByEmail,
    findByPhoneNumber,
    findByEmailOrPhone,
    createOtp,
    updateOtp,
    deleteOtp
};
