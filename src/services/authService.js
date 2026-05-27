'use strict';
const bcrypt = require('bcrypt');
const { sequelize } = require('../models');
const companyRepository = require('../repositories/companyRepository');
const otpRepository = require('../repositories/otpRepository');
const otpService = require('./otpService');
const tokenService = require('./tokenService');
const { applicationLogger, errorLogger } = require('../configs/logger');

const createError = (message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

/**
 * Starts company registration, checks uniqueness, hashes password, and triggers OTP.
 */
const initiateRegistration = async (payload) => {
    applicationLogger.info(`REGISTRATION ATTEMPT - Email: ${payload.email}, Phone: ${payload.phoneNumber}`);

    // 1. Check if email already registered in DB
    const existingEmail = await companyRepository.findByEmail(payload.email);
    if (existingEmail) {
        throw createError('Email is already registered', 400);
    }

    // 2. Check if phone number already registered in DB
    const existingPhone = await companyRepository.findByPhoneNumber(payload.phoneNumber);
    if (existingPhone) {
        throw createError('Phone number is already registered', 400);
    }

    // 3. Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // 4. Store registration request detail in JSON payload (including password hash)
    const registrationPayload = {
        companyName: payload.companyName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        password: hashedPassword,
        role: payload.role.toUpperCase(),
        termsAccepted: payload.termsAccepted,
        gstNumber: payload.gstNumber || null,
        cinNumber: payload.cinNumber || null
    };

    // 5. Generate and store OTP codes in database
    const otps = await otpService.generateAndSendOtp(
        payload.email,
        payload.phoneNumber,
        registrationPayload
    );

    return {
        emailOtp: otps.emailOtp,
        mobileOtp: otps.mobileOtp
    };
};

/**
 * Verifies channel OTP and triggers automatic final registration if both verified.
 */
const verifyOtp = async (channel, identifier, otp) => {
    // 1. Run channel OTP verification state update
    const otpRecord = await otpService.verifyOtp(channel, identifier, otp);

    // 2. Check if both email and mobile channels are verified
    if (otpRecord.is_email_verified && otpRecord.is_mobile_verified) {
        // Start final registration inside a transaction
        const transaction = await sequelize.transaction();
        try {
            const finalData = await completeRegistration(otpRecord, transaction);

            // Commit transaction
            await transaction.commit();

            // Delete the temporary OTP verification record
            await otpRepository.deleteOtp(otpRecord.id);

            return {
                isCompleted: true,
                data: finalData
            };
        } catch (err) {
            // Rollback transaction on failure
            await transaction.rollback();
            errorLogger.error(`REGISTRATION TRANSACTION ROLLBACK - Email: ${otpRecord.email}. Error: ${err.message} - ${err.stack}`);
            throw err;
        }
    }

    // If only one channel is verified
    const channelLabel = channel.toUpperCase() === 'EMAIL' ? 'Email' : 'Mobile';
    return {
        isCompleted: false,
        message: `${channelLabel} verified successfully`
    };
};

/**
 * Completes registration inside a transaction (creates Company, Role mapping, and saves RefreshToken).
 */
const completeRegistration = async (otpRecord, transaction) => {
    const payload = otpRecord.registration_payload;

    // 1. Find the role master entry corresponding to the role code
    const roleMaster = await companyRepository.findRoleMasterByCode(payload.role);
    if (!roleMaster) {
        throw createError(`Specified role code '${payload.role}' does not exist in master roles`, 400);
    }

    // 2. Create the Company record
    const companyData = {
        company_name: payload.companyName,
        company_email: payload.email,
        mobile_number: payload.phoneNumber,
        password: payload.password, // already hashed
        gst_number: payload.gstNumber,
        cin_number: payload.cinNumber,
        terms_accepted: payload.termsAccepted,
        is_active: true,
        is_email_verified: true,
        is_mobile_number_verified: true
    };

    const company = await companyRepository.createCompany(companyData, { transaction });

    // 3. Create the CompanyRole mapping record
    const companyRoleData = {
        company_id: company.id,
        role_id: roleMaster.id
    };

    await companyRepository.createCompanyRole(companyRoleData, { transaction });

    // 4. Generate Access and Refresh tokens
    const tokens = await tokenService.generateTokens(company, roleMaster.role_code);

    // 5. Save the refresh token in database (hashed)
    await tokenService.saveRefreshToken(company.id, tokens.refreshToken, { transaction });

    applicationLogger.info(`REGISTRATION SUCCESSFUL - Company ID: ${company.id}, Email: ${company.company_email}`);

    // Clean company record of sensitive fields
    const companyClean = company.toJSON();
    delete companyClean.password;

    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        company: companyClean
    };
};

module.exports = {
    initiateRegistration,
    verifyOtp,
    completeRegistration
};
