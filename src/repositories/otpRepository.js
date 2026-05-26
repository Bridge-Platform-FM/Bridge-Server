'use strict';
const { OtpVerification } = require('../models');
const { Op } = require('sequelize');

class OtpRepository {
    async findByEmail(email) {
        return await OtpVerification.findOne({
            where: { email }
        });
    }

    async findByPhoneNumber(phoneNumber) {
        return await OtpVerification.findOne({
            where: { phone_number: phoneNumber }
        });
    }

    async findByEmailOrPhone(email, phoneNumber) {
        return await OtpVerification.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { phone_number: phoneNumber }
                ]
            }
        });
    }

    async createOtp(otpData) {
        return await OtpVerification.create(otpData);
    }

    async updateOtp(id, otpData) {
        return await OtpVerification.update(otpData, {
            where: { id },
            returning: true
        });
    }

    async deleteOtp(id, { transaction } = {}) {
        return await OtpVerification.destroy({
            where: { id },
            transaction
        });
    }
}

module.exports = new OtpRepository();
