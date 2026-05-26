'use strict';
const env = require('../configs/env_configs');
const otpRepository = require('../repositories/otpRepository');
const generateOtp = require('../utils/generateOtp');
const { printOtp, printSingleOtp } = require('../utils/otpHelper');
const { applicationLogger } = require('../configs/logger');

const createError = (message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

class OtpService {
    /**
     * Generates and stores OTPs for email and mobile.
     */
    async generateAndSendOtp(email, phoneNumber, registrationPayload) {
        // 1. Generate new OTPs
        const emailOtp = generateOtp();
        const mobileOtp = generateOtp();

        const now = new Date();
        const emailOtpExpiry = new Date(now.getTime() + env.OTP.EXPIRY_MINUTES * 60 * 1000);
        const mobileOtpExpiry = new Date(now.getTime() + env.OTP.EXPIRY_MINUTES * 60 * 1000);

        // 2. Check if an OTP record already exists for this signup process
        let otpRecord = await otpRepository.findByEmailOrPhone(email, phoneNumber);

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
            registration_payload: registrationPayload
        };

        if (otpRecord) {
            // Keep old resend count if within cooldown/history, or reset if needed.
            // Let's update the existing record
            await otpRepository.updateOtp(otpRecord.id, recordData);
            otpRecord = await otpRepository.findByEmailOrPhone(email, phoneNumber);
        } else {
            // Create a new record
            otpRecord = await otpRepository.createOtp({
                ...recordData,
                email_resend_count: 0,
                mobile_resend_count: 0,
                email_last_sent_at: now,
                mobile_last_sent_at: now
            });
        }

        // 3. Print OTP to console and log
        printOtp(email, emailOtp, phoneNumber, mobileOtp);

        return {
            emailOtp,
            mobileOtp
        };
    }

    /**
     * Verifies the OTP for a single channel.
     * Returns verification state of the record.
     */
    async verifyOtp(channel, identifier, otp) {
        const now = new Date();
        let record = null;

        // 1. Fetch OTP record by channel identifier
        if (channel.toUpperCase() === 'EMAIL') {
            record = await otpRepository.findByEmail(identifier);
        } else {
            record = await otpRepository.findByPhoneNumber(identifier);
        }

        if (!record) {
            throw createError('OTP verification record not found or expired', 404);
        }

        const isEmailChannel = channel.toUpperCase() === 'EMAIL';

        // 2. Check if channel is temporarily blocked
        const blockedUntil = isEmailChannel ? record.email_blocked_until : record.mobile_blocked_until;
        if (blockedUntil && now < new Date(blockedUntil)) {
            const minutesLeft = Math.ceil((new Date(blockedUntil) - now) / 60000);
            throw createError(`Verification is temporarily blocked for this channel. Please try again in ${minutesLeft} minutes.`, 403);
        }

        // 3. Check OTP Expiry
        const otpExpiry = isEmailChannel ? record.email_otp_expiry : record.mobile_otp_expiry;
        if (!otpExpiry || now > new Date(otpExpiry)) {
            // Expired OTP counts as a failed attempt
            await this.handleFailedAttempt(record, isEmailChannel);
            throw createError('OTP has expired', 400);
        }

        // 4. Verify OTP value
        const storedOtp = isEmailChannel ? record.email_otp : record.mobile_otp;
        if (storedOtp !== otp) {
            await this.handleFailedAttempt(record, isEmailChannel);
            // Refetch record to get updated verify attempts
            const updatedRecord = await otpRepository.findByEmailOrPhone(record.email, record.phone_number);
            const attempts = isEmailChannel ? updatedRecord.email_verify_attempts : updatedRecord.mobile_verify_attempts;
            const remaining = Math.max(0, env.OTP.MAX_VERIFY_ATTEMPTS - attempts);

            if (remaining === 0) {
                throw createError('Wrong OTP. Maximum verification attempts exceeded. Blocked for 15 minutes.', 400);
            } else {
                throw createError(`Invalid OTP. ${remaining} attempts remaining.`, 400);
            }
        }

        // 5. If correct, reset verify attempts and set verified to true
        const updateData = {};
        if (isEmailChannel) {
            updateData.is_email_verified = true;
            updateData.email_verify_attempts = 0;
            updateData.email_blocked_until = null;
        } else {
            updateData.is_mobile_verified = true;
            updateData.mobile_verify_attempts = 0;
            updateData.mobile_blocked_until = null;
        }

        await otpRepository.updateOtp(record.id, updateData);

        // Fetch the latest state
        const finalRecord = await otpRepository.findByEmailOrPhone(record.email, record.phone_number);

        applicationLogger.info(`OTP VERIFICATION - Channel ${channel} verified successfully for identifier: ${identifier}`);

        return finalRecord;
    }

    /**
     * Helper to process failed verification attempts.
     */
    async handleFailedAttempt(record, isEmailChannel) {
        const attempts = (isEmailChannel ? record.email_verify_attempts : record.mobile_verify_attempts) + 1;
        const updateData = {};

        if (isEmailChannel) {
            updateData.email_verify_attempts = attempts;
            if (attempts >= env.OTP.MAX_VERIFY_ATTEMPTS) {
                updateData.email_blocked_until = new Date(Date.now() + env.OTP.BLOCK_DURATION_MINUTES * 60 * 1000);
                applicationLogger.info(`ACCOUNT TEMPORARY BLOCK - Channel EMAIL blocked for ${record.email} until ${updateData.email_blocked_until}`);
            }
        } else {
            updateData.mobile_verify_attempts = attempts;
            if (attempts >= env.OTP.MAX_VERIFY_ATTEMPTS) {
                updateData.mobile_blocked_until = new Date(Date.now() + env.OTP.BLOCK_DURATION_MINUTES * 60 * 1000);
                applicationLogger.info(`ACCOUNT TEMPORARY BLOCK - Channel MOBILE blocked for ${record.phone_number} until ${updateData.mobile_blocked_until}`);
            }
        }

        await otpRepository.updateOtp(record.id, updateData);
    }

    /**
     * Resends OTP for a single channel.
     */
    async resendOtp(channel, identifier) {
        const now = new Date();
        let record = null;

        // 1. Fetch OTP record
        if (channel.toUpperCase() === 'EMAIL') {
            record = await otpRepository.findByEmail(identifier);
        } else {
            record = await otpRepository.findByPhoneNumber(identifier);
        }

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

        // 4. Generate new OTP and expiry
        const newOtp = generateOtp();
        const newExpiry = new Date(now.getTime() + env.OTP.EXPIRY_MINUTES * 60 * 1000);

        // 5. Update DB
        const updateData = {};
        if (isEmailChannel) {
            updateData.email_otp = newOtp;
            updateData.email_otp_expiry = newExpiry;
            updateData.email_resend_count = resendCount + 1;
            updateData.email_last_sent_at = now;
            updateData.email_verify_attempts = 0;
            updateData.email_blocked_until = null;
        } else {
            updateData.mobile_otp = newOtp;
            updateData.mobile_otp_expiry = newExpiry;
            updateData.mobile_resend_count = resendCount + 1;
            updateData.mobile_last_sent_at = now;
            updateData.mobile_verify_attempts = 0;
            updateData.mobile_blocked_until = null;
        }

        await otpRepository.updateOtp(record.id, updateData);

        // 6. Print to console and log
        printSingleOtp(channel, identifier, newOtp);

        return {
            otp: newOtp
        };
    }
}

module.exports = new OtpService();
