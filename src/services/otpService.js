'use strict';
const env = require('../configs/env_configs');
const otpRepository = require('../repositories/otpRepository');
const generateOtp = require('../utils/generateOtp');
const { printOtp, printSingleOtp } = require('../utils/otpHelper');
const ServiceResponse = require('../utils/ServiceResponse');
const createError = (message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return err;
};


/**
 * Generates and stores OTPs for email and mobile.
 */
const generateAndSendOtp = async (email, phoneNumber, registrationPayload) => {
    // 1. Generate new OTPs
    const emailOtp = generateOtp();
    const mobileOtp = generateOtp();

    const now = new Date();
    const emailOtpExpiry = new Date(now.getTime() + env.OTP.EXPIRY_MINUTES * 60 * 1000);
    const mobileOtpExpiry = new Date(now.getTime() + env.OTP.EXPIRY_MINUTES * 60 * 1000);

    // 2. Soft-delete any existing active OTP records for this email/phone number
    await otpRepository.softDeleteActiveByEmailOrPhone(email, phoneNumber);

    const recordData = {
        email,
        phone_number: phoneNumber,
        email_otp: emailOtp,
        mobile_otp: mobileOtp,
        email_otp_expiry: emailOtpExpiry,
        mobile_otp_expiry: mobileOtpExpiry,
        email_verify_attempts: 0,
        mobile_verify_attempts: 0,
        email_blocked_until: null,
        mobile_blocked_until: null,
        is_email_verified: false,
        is_mobile_verified: false,
        registration_payload: registrationPayload,
        is_deleted: false
    };

    // Create a new record
    await otpRepository.createOtp({
        ...recordData,
        email_resend_count: 0,
        mobile_resend_count: 0,
        email_last_sent_at: now,
        mobile_last_sent_at: now
    });

    // 3. Print OTP to console and log
    printOtp(email, emailOtp, phoneNumber, mobileOtp);

    return ServiceResponse.success({
        data: {
            emailOtp,
            mobileOtp
        }
    });
};

/**
 * Verifies the OTP for a single channel.
 * Returns verification state of the record.
 */
const verifyOtp = async (channel, identifier, otp) => {
    const now = new Date();
    const isEmailChannel = channel.toUpperCase() === 'EMAIL';

    // Channel-specific field mapping
    const config = {
        otpField: isEmailChannel ? 'email_otp' : 'mobile_otp',
        expiryField: isEmailChannel ? 'email_otp_expiry' : 'mobile_otp_expiry',
        attemptsField: isEmailChannel
            ? 'email_verify_attempts'
            : 'mobile_verify_attempts',
        blockedField: isEmailChannel
            ? 'email_blocked_until'
            : 'mobile_blocked_until',
        verifiedField: isEmailChannel
            ? 'is_email_verified'
            : 'is_mobile_verified',
        findRecord: isEmailChannel
            ? otpRepository.findByEmail
            : otpRepository.findByPhoneNumber
    };

    // 1. Fetch OTP record
    const record = await config.findRecord(identifier);

    if (!record) {
        throw createError('OTP verification record not found or expired', 404);
    }

    // 2. Check if channel is blocked
    const blockedUntil = record[config.blockedField];

    if (blockedUntil && now < new Date(blockedUntil)) {
        const minutesLeft = Math.ceil(
            (new Date(blockedUntil) - now) / 60000
        );

        throw createError(
            `Verification is temporarily blocked for this channel. Please try again in ${minutesLeft} minutes.`,
            403
        );
    }

    // 3. Check max verification attempts
    const currentAttempts = record[config.attemptsField];

    if (currentAttempts >= env.OTP.MAX_VERIFY_ATTEMPTS) {
        throw createError(
            'Maximum verification attempts exceeded. Please request a new OTP or wait for the cooldown period to end.',
            403
        );
    }

    // 4. Check OTP expiry
    const otpExpiry = record[config.expiryField];

    if (!otpExpiry || now > new Date(otpExpiry)) {
        await handleFailedAttempt(record, isEmailChannel);
        throw createError('OTP has expired', 400);
    }

    // 5. Validate OTP
    const storedOtp = record[config.otpField];

    if (storedOtp !== otp) {
        await handleFailedAttempt(record, isEmailChannel);

        // Fetch updated attempts after increment
        const updatedRecord = await otpRepository.findByEmailOrPhone(
            record.email,
            record.phone_number
        );

        const updatedAttempts =
            updatedRecord[config.attemptsField];

        const remainingAttempts = Math.max(
            0,
            env.OTP.MAX_VERIFY_ATTEMPTS - updatedAttempts
        );

        if (remainingAttempts === 0) {
            throw createError(
                `Wrong OTP. Maximum verification attempts exceeded. Blocked for ${env.OTP.BLOCK_DURATION_MINUTES} minutes.`,
                403
            );
        }
        throw createError(
            `Invalid OTP. ${remainingAttempts} attempts remaining.`,
            400
        );
    }

    // 6. OTP verified successfully
    const updateData = {
        [config.verifiedField]: true,
        [config.attemptsField]: 0,
        [config.blockedField]: null
    };

    await otpRepository.updateOtp(record.id, updateData);

    // Fetch latest updated state
    const finalRecord = await otpRepository.findByEmailOrPhone(
        record.email,
        record.phone_number
    );

    return ServiceResponse.success({
        message: `${channel} OTP verified successfully`,
        data: finalRecord
    });
};

/**
 * Helper to process failed verification attempts.
 */
const handleFailedAttempt = async (record, isEmailChannel) => {
    const attempts = (isEmailChannel ? record.email_verify_attempts : record.mobile_verify_attempts) + 1;
    const updateData = {};

    if (isEmailChannel) {
        updateData.email_verify_attempts = attempts;
        if (attempts >= env.OTP.MAX_VERIFY_ATTEMPTS) {
            updateData.email_blocked_until = new Date(Date.now() + env.OTP.BLOCK_DURATION_MINUTES * 60 * 1000);
            // applicationLogger.info(`ACCOUNT TEMPORARY BLOCK - Channel EMAIL blocked for ${record.email} until ${updateData.email_blocked_until}`);
        }
    } else {
        updateData.mobile_verify_attempts = attempts;
        if (attempts >= env.OTP.MAX_VERIFY_ATTEMPTS) {
            updateData.mobile_blocked_until = new Date(Date.now() + env.OTP.BLOCK_DURATION_MINUTES * 60 * 1000);
            // applicationLogger.info(`ACCOUNT TEMPORARY BLOCK - Channel MOBILE blocked for ${record.phone_number} until ${updateData.mobile_blocked_until}`);
        }
    }

    await otpRepository.updateOtp(record.id, updateData);
};

/**
 * Resends OTP for a single channel.
 */
const resendOtp = async (channel, identifier) => {
    const now = new Date();
    // 1. Fetch OTP record
    const record = channel.toUpperCase() === 'EMAIL'
        ? await otpRepository.findByEmail(identifier)
        : await otpRepository.findByPhoneNumber(identifier);

    if (!record) {
        throw createError('OTP verification record not found or expired', 404);
    }

    const isEmailChannel = channel.toUpperCase() === 'EMAIL';
    const lastSentAt = isEmailChannel ? record.email_last_sent_at : record.mobile_last_sent_at;

    // 2. Cooldown check (60 seconds)
    if (lastSentAt && (now - new Date(lastSentAt)) < env.OTP.RESEND_COOLDOWN_SECONDS * 1000) {
        const secondsLeft = Math.ceil(env.OTP.RESEND_COOLDOWN_SECONDS - (now - new Date(lastSentAt)) / 1000);
        throw createError(`Please wait ${secondsLeft} seconds before requesting a new OTP.`, 400);
    }

    // 3. Rate limit check (10 attempts in 1 hour)
    let resendCount = isEmailChannel ? record.email_resend_count : record.mobile_resend_count;
    if (lastSentAt && (now - new Date(lastSentAt)) > 60 * 60 * 1000) {
        // Reset resend counter after 1 hour automatically
        resendCount = 0;
    }

    if (resendCount >= env.OTP.MAX_RESEND_PER_HOUR) {
        throw createError(`Maximum resend limit of ${env.OTP.MAX_RESEND_PER_HOUR} attempts per hour reached. Please try again later.`, 400);
    }

    // 4. Check if the existing OTP is still valid (not expired)
    const otpExpiry = isEmailChannel ? record.email_otp_expiry : record.mobile_otp_expiry;
    const isExpired = !otpExpiry || now > new Date(otpExpiry);

    const updateData = {};
    let otpToSend;

    if (!isExpired) {
        // Reuse existing OTP
        otpToSend = isEmailChannel ? record.email_otp : record.mobile_otp;
    } else {
        // Generate new OTP and expiry
        otpToSend = generateOtp();
        const newExpiry = new Date(now.getTime() + env.OTP.EXPIRY_MINUTES * 60 * 1000);

        if (isEmailChannel) {
            updateData.email_otp = otpToSend;
            updateData.email_otp_expiry = newExpiry;
        } else {
            updateData.mobile_otp = otpToSend;
            updateData.mobile_otp_expiry = newExpiry;
        }
    }

    // Common updates for resend (reset attempts, update cooldown timestamp, increment resend count)
    if (isEmailChannel) {
        updateData.email_last_sent_at = now;
        updateData.email_resend_count = resendCount + 1;
        updateData.email_verify_attempts = 0;
        updateData.email_blocked_until = null;
    } else {
        updateData.mobile_last_sent_at = now;
        updateData.mobile_resend_count = resendCount + 1;
        updateData.mobile_verify_attempts = 0;
        updateData.mobile_blocked_until = null;
    }

    await otpRepository.updateOtp(record.id, updateData);

    // Print to console and log
    printSingleOtp(channel, identifier, otpToSend);

    return {
        otp: otpToSend
    };
};

module.exports = {
    generateAndSendOtp,
    verifyOtp,
    handleFailedAttempt,
    resendOtp
};
