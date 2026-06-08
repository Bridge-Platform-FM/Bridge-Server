'use strict';
const bcrypt = require('bcrypt');
const { sequelize } = require('../models');
const companyRepository = require('../repositories/companyRepository');
const userRepository = require('../repositories/userRepository');
const otpRepository = require('../repositories/otpRepository');
const tokenService = require('./tokenService');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { hashPassword } = require('../utils/Helper');
const { REGISTRATION_MESSAGES } = require('../utils/constant');

const checkEmailExists = async (email) => {
    try {
        const existingEmailUser = await companyRepository.findByEmail(email);
        if (existingEmailUser) {
            return ServiceResponse.error({message:'Email is already registered.', data:existingEmailUser, statusCode:400});
        }
        else {
            return ServiceResponse.success({data:existingEmailUser});
        }
    }
    catch (error) {
        errorLogger.error(error);
        console.error(error);
        return ServiceResponse.error({message:'Error occured while checking email.', data:[], statusCode:500});
    }
};

// const prepareOtpPayload = async (companyName, email, phoneNumber, password, role, termsAccepted, gstNumber, cinNumber) => {
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const registrationPayload = {
//             companyName: companyName,
//             email: email,
//             phoneNumber: phoneNumber,
//             password: hashedPassword,
//             role: role.toUpperCase(),
//             termsAccepted: termsAccepted,
//             gstNumber: gstNumber || null,
//             cinNumber: cinNumber || null
//         };

//         return ServiceResponse.success({message: 'Registration payload prepared successfully', data: registrationPayload, statusCode: 200});
//     }
//     catch (error) {
//         errorLogger.error(error);
//         return ServiceResponse.error({message: 'Error occured while preparing registration', data: [], statusCode: 500});
//     }
// };

const createCompany = async (data) => {
    const transaction = await sequelize.transaction();
    console.log("createCompany data: ", data);
    try {
        // TODO:- encyption add
        // TODO:- need to remove termsAccepted
        const companyData = {
            company_name: data.companyName,
            company_email: data.email, 
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
            created_at: new Date()
        };
        const user = await userRepository.createUser(userData, { transaction });

        await companyRepository.createCompanyUserRole(
            { company_id: company.id, role_id: role.id, user_id: user.id },
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


// const initiateRegistration = async (payload) => {
//     try {
//         // 1. Check if email already registered in DB
//         const existingEmail = await companyRepository.findByEmail(payload.email);
//         if (existingEmail) {
//             throw ('Email is already registered', 400);
//         }

//         // 2. Check if phone number already registered in DB
//         const existingPhone = await companyRepository.findByPhoneNumber(payload.phoneNumber);
//         if (existingPhone) {
//             throw createError('Phone number is already registered', 400);
//         }

//         // 3. Hash password using bcrypt
//         const hashedPassword = await bcrypt.hash(payload.password, 10);

//         // 4. Store registration request detail in JSON payload (including password hash)
//         const registrationPayload = {
//             companyName: payload.companyName,
//             email: payload.email,
//             phoneNumber: payload.phoneNumber,
//             password: hashedPassword,
//             role: payload.role.toUpperCase(),
//             termsAccepted: payload.termsAccepted,
//             gstNumber: payload.gstNumber || null,
//             cinNumber: payload.cinNumber || null
//         };

//         // 5. Generate and store OTP codes in database
//         // const otps = await otpService.generateAndSendOtp(
//         //     payload.email,
//         //     payload.phoneNumber,
//         //     registrationPayload
//         // );

//         return ServiceResponse.success({
//             message: 'Registration payload prepared successfully',
//             data: registrationPayload
//         });
//     }
//     catch (error) {
//         return ServiceResponse.error({
//             message: error.message || 'Error occured while preparing registration',
//             data: []
//         });
//     };
// };

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
            updatedCompany = await companyRepository.updateEmailVerifiedStatus(company_id, true);
        } else if (channel === 'PHONE') {
            updatedCompany = await companyRepository.updatePhoneVerifiedStatus(company_id, true);
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

/**
 * Completes registration inside a transaction (creates Company, Role mapping, and saves RefreshToken).
 */
// const completeRegistration = async (otpRecord, transaction) => {
//     const payload = otpRecord.registration_payload;

//     // 1. Find the role master entry corresponding to the role code
//     const roleMaster = await companyRepository.findRoleMasterByCode(payload.role);
//     if (!roleMaster) {
//         throw createError(`Specified role code '${payload.role}' does not exist in master roles`, 400);
//     }

//     // 2. Create the Company record
//     const companyData = {
//         company_name: payload.companyName,
//         company_email: payload.email,
//         mobile_number: payload.phoneNumber,
//         password: payload.password, // already hashed
//         gst_number: payload.gstNumber,
//         cin_number: payload.cinNumber,
//         terms_accepted: payload.termsAccepted,
//         is_active: true,
//         is_email_verified: true,
//         is_mobile_number_verified: true
//     };

//     const company = await companyRepository.createCompany(companyData, { transaction });

//     // 3. Create the CompanyRole mapping record
//     const companyRoleData = {
//         company_id: company.id,
//         role_id: roleMaster.id
//     };

//     await companyRepository.createCompanyRole(companyRoleData, { transaction });

//     // 4. Generate Access and Refresh tokens
//     const tokens = await tokenService.generateTokens(company, roleMaster.role_code);

//     // 5. Save the refresh token in database (hashed)
//     // generateTokens returns ServiceResponse, so unwrap .data to get the actual tokens
//     await tokenService.saveRefreshToken(company.id, tokens.data.refreshToken, { transaction });

//     return ServiceResponse.success({
//         message: 'Registration completed successfully',
//         data: {
//             accessToken: tokens.data.accessToken,
//             refreshToken: tokens.data.refreshToken
//         }
//     });
// };


module.exports = {
    // initiateRegistration,
    // verifyOtp,
    // completeRegistration,
    checkEmailExists,
    // prepareOtpPayload,
    createCompany,
    updateChannelVerifiedStatus
};
