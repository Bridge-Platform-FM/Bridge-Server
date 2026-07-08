'use strict';
const bcrypt = require('bcrypt');
const { sequelize } = require('../models');
const companyRepository = require('../repositories/companyRepository');
const userRepository = require('../repositories/userRepository');
const tokenService = require('./tokenService');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { hashPassword } = require('../utils/Helper');
const { REGISTRATION_MESSAGES, AUTH_MESSAGES } = require('../utils/constant');


const getCompanyByEmail = async (email) => {
    try {
        const existingEmailUser = await companyRepository.findByEmail(email);
        return ServiceResponse.success({data:existingEmailUser});
    }
    catch (error) {
    console.error('getUserByEmail ERROR:', error);

    return ServiceResponse.error({
        message:'Error occured while checking company email.',
        data:[error.message],
        statusCode:500
    });
}
}

const getUserByEmail = async (email) => {
    try {
        const existingEmailUser = await userRepository.findByEmail(email);
        return ServiceResponse.success({data:existingEmailUser});
    }
    catch (error) {
    console.error('getUserByEmail ERROR:', error);

    return ServiceResponse.error({
        message:'Error occured while checking user email.',
        data:[error.message],
        statusCode:500
    });
}
}


const createCompany = async (data) => {
    const transaction = await sequelize.transaction();
    // console.log("createCompany data: ", data);
    try {
        // TODO:- encyption add
        // TODO:- need to remove termsAccepted
        const companyData = {
            company_name: data.companyName,
            company_email: data.email, 
            country_code: data.countryCode,
            mobile_number: data.phoneNumber,
            password: await hashPassword(data.password),
            gst_number: data?.gstNumber,
            cin_number: data?.cinNumber, 
            terms_accepted: data.termsAccepted, 
            is_email_verified: false,
            is_mobile_number_verified: false,
            created_at: new Date(),
        };
        // TODO: consistant mobile and email id variables
        const company = await companyRepository.createCompany(companyData, transaction);
        const role = await companyRepository.findRoleMasterByCode(data.role);

        const userData = {
            company_email: data.email,
            password: await hashPassword(data.password),
            mobile_number: data.phoneNumber,
            country_code: data.countryCode,
            created_at: new Date()
        };
        const user = await userRepository.createUser(userData, { transaction });

        await companyRepository.createCompanyUserRole(
            { company_id: company.id, role_id: role.id, user_id: user.id, is_default_role: true },
            { transaction }
        );
        await transaction.commit();

        return ServiceResponse.success({message: REGISTRATION_MESSAGES.REGISTRATION_SUCCESS, data: { company, role, user }, statusCode: 201});
    }
    catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({message: REGISTRATION_MESSAGES.COMPANY_CREATION_FAILED, data: [], statusCode: 500});
    }
};


/**
 * Verifies channel OTP and triggers automatic final registration if both verified.
 * 
 */

// Service to update channel verified Status
const updateChannelVerifiedStatus = async (channel, company_id) => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Update the respective channel verified status in company table
        let updatedCompany;
        if (channel === 'EMAIL') {
            updatedCompany = await companyRepository.updateEmailVerifiedStatus(company_id, true, {transaction});
        } else if (channel === 'PHONE') {
            updatedCompany = await companyRepository.updatePhoneVerifiedStatus(company_id, true, {transaction});
        } else {
            throw new Error('Invalid channel specified');
        }
        await transaction.commit();
        return ServiceResponse.success({message: 'Channel verification status updated successfully', data: updatedCompany, statusCode: 200});
    } catch (err) {
        await transaction.rollback();
        errorLogger.error(err);
        return ServiceResponse.error({
            message: 'Error encountered.',
            data: []
        });
    }
};


const checkPassword = async (password, hashedPassword) => {
    try {
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        if (!isPasswordValid) {
            return ServiceResponse.error({ message: AUTH_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
        }
        else {
            return ServiceResponse.success({ statusCode: 200 });
        }
    } catch (error) {
        return ServiceResponse.error({ message: AUTH_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
    }
}
/*
const checkPassword = async (password, hashedPassword) => {
    try {

        if (password === hashedPassword) {
            return ServiceResponse.success({ statusCode: 200 });
        }

        return ServiceResponse.error({
            message: AUTH_MESSAGES.INVALID_CREDENTIALS,
            statusCode: 401
        });

    } catch (error) {
        return ServiceResponse.error({
            message: AUTH_MESSAGES.INVALID_CREDENTIALS,
            statusCode: 401
        });
    }
}
*/

const getCompanyUser_role = async (company_id, user_id) => {
    try {
        const result = await userRepository.getCompanyUser_role(company_id, user_id);
        return ServiceResponse.success({data: result[0]})
    } catch (error) {
        errorLogger.error(error);

        return ServiceResponse.error({
            message: error.message,
            statusCode: 500
    });
}
}


const resetPassword = async (email, newPassword) => {
    const transaction = await sequelize.transaction();
    try {
        const hashedPassword = await hashPassword(newPassword);

        await companyRepository.updatePasswordByEmail(email, hashedPassword, { transaction });
        await userRepository.updatePasswordByEmail(email, hashedPassword, { transaction });

        await transaction.commit();
        return ServiceResponse.success({ message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS, statusCode: 200 });
    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({ message: AUTH_MESSAGES.PASSWORD_RESET_FAILED, statusCode: 500 });
    }
};

module.exports = {
    checkPassword,
    createCompany,
    updateChannelVerifiedStatus,
    getCompanyByEmail,
    getUserByEmail,
    getCompanyUser_role,
    resetPassword
};
