'use strict';
const bcrypt = require('bcrypt');
const adminRepository = require('../repositories/adminRepository');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { ADMIN_MESSAGES } = require('../utils/constant');
const { maskPhone, maskEmail } = require('../utils/Helper');


const login = async (email, password) => {
    try {
        const admin = await adminRepository.findByEmail(email);
        if (!admin) {
            return ServiceResponse.error({ message: ADMIN_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return ServiceResponse.error({ message: ADMIN_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
        }

        const payload = {
            adminId: admin.id,
            email: admin.email,
            mobileNumber: admin.mobile_number,
            role: admin.role
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const maskedMobile = maskPhone(admin.country_code + admin.mobile_number);
        const maskedEmail = maskEmail(admin.email);

        return ServiceResponse.success({
            message: ADMIN_MESSAGES.LOGIN_SUCCESS,
            data: { accessToken, refreshToken, maskedMobile, maskedEmail },
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: ADMIN_MESSAGES.LOGIN_FAILED, statusCode: 500 });
    }
};

const findByEmail = async (email) => {
    try {
        const admin = await adminRepository.findByEmail(email);
        return ServiceResponse.success({ data: admin });
    } catch (error) {
        return ServiceResponse.error({ message: 'Error occured while checking email.', data: [], statusCode: 500 });
    }
}




module.exports = { login, findByEmail };
