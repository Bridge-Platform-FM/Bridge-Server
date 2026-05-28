'use strict';
const { OtpVerification } = require('../models');
const { Op } = require('sequelize');

const findByEmail = async (email) => {
    return await OtpVerification.findOne({
        where: { email, is_deleted: false }
    });
};

const findByPhoneNumber = async (phoneNumber) => {
    return await OtpVerification.findOne({
        where: { phone_number: phoneNumber, is_deleted: false }
    });
};

const findByEmailOrPhone = async (email, phoneNumber) => {
    return await OtpVerification.findOne({
        where: {
            [Op.or]: [
                { email: email },
                { phone_number: phoneNumber }
            ],
            is_deleted: false
        }
    });
};

const softDeleteActiveByEmailOrPhone = async (email, phoneNumber) => {
    return await OtpVerification.update({ is_deleted: true }, {
        where: {
            [Op.or]: [
                { email: email },
                { phone_number: phoneNumber }
            ],
            is_deleted: false
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
    return await OtpVerification.update({ is_deleted: true }, {
        where: { id },
        transaction
    });
};

module.exports = {
    findByEmail,
    findByPhoneNumber,
    findByEmailOrPhone,
    softDeleteActiveByEmailOrPhone,
    createOtp,
    updateOtp,
    deleteOtp
};
