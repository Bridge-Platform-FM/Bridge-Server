// Fixed: Passed strings to require() and removed destructuring for redis instance
const redis = require("../configs/redis.js");
const { OTP_MESSAGES } = require("../utils/constant.js");
const { generateOTP } = require("../utils/Helper.js");
const { smsClient } = require("../configs/twilio.js");
const { sgMailClient } = require("../configs/twilio.js");
const ServiceResponse = require("../utils/ServiceResponse.js");
const { errorLogger } = require("../configs/logger.js");
const { CHANNEL_TYPE } = require("../utils/constant.js")

require('dotenv').config();

const sendOtpToPhone = async (phone, otp) => {
    try {
        const id = await smsClient.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
        // console.log(`OTP sent to phone ${phone}, message SID: ${id}`);
    } catch (err) {
        errorLogger.error(`Error sending OTP to phone ${phone}:`, err);
        console.error(`Error sending OTP to phone ${phone}:`, err);
        throw new Error("Failed to send OTP");
    }
};

const sendOtpToEmail = async (email, otp) => {
    try {
        const msg = {
            to: email,
            from: {
                name: "Bridge Support",
                email: process.env.SENDGRID_EMAIL_FROM
            },
            subject: "Bridge OTP Verification",
            html: `<p>Your OTP is <strong>${otp}</strong></p>`,
        };
        await sgMailClient.send(msg);
    } catch (err) {
        errorLogger.error(`Error sending OTP to email ${email}:`, err);
        console.error(`Error sending OTP to email ${email}:`, err);
        throw new Error("Failed to send OTP");
    }
};

const sendOTP = async (channelType, channelId, { purpose = 'default', isResend = false } = {}) => {
    try {
        // Resend counter is scoped per flow (purpose) AND per channel, so each
        // flow has its own independent allowance.
        const countKey = `otp_resend_count:${purpose}:${channelId}`;

        // A send counts as a "resend" if the caller flagged it OR an OTP session
        // is already active for this channel. The login/admin MFA screen resends
        // by re-calling trigger-otp (isResend:false), so a repeat trigger while a
        // previous OTP is still alive must be treated as a resend.
        const activeOtp = await redis.get(`otp:${channelId}`);
        const countsAsResend = isResend || Boolean(activeOtp);

        // 0. Remove previous otp
        await redis.del(`otp:${channelId}`);

        // 1. Check block
        const blocked = await redis.get(`otp_block:${channelId}`);
        if (blocked) {
            return ServiceResponse.error({ message: OTP_MESSAGES.BLOCKED, statusCode: 403 });
        }

        // 2. Check resend timer
        const resendExists = await redis.get(`otp_resend:${channelId}`);
        if (resendExists) {
            return ServiceResponse.error({ message: OTP_MESSAGES.RESEND_TIMER, statusCode: 429 });
        }

        // 3. Check resend count (only resends count toward the limit)
        if (countsAsResend) {
            const resendCount = await redis.get(countKey);
            if (resendCount && Number(resendCount) >= Number(process.env.MAX_RESEND || 10)) {
                return ServiceResponse.error({ message: OTP_MESSAGES.MAX_RESEND, statusCode: 400 });
            }
        }

        // An initial send starts a fresh flow, so reset that flow's resend count.
        // Done after the checks above so a blocked/cooldown attempt never wipes it.
        if (!countsAsResend) {
            await redis.del(countKey);
        }

        // 3. Generate OTP
        const otp = generateOTP();
        console.log(`Generated OTP for channel ${channelId}: ${otp}`);

        // 4. Save OTP
        await redis.set(`otp:${channelId}`, otp, "EX", Number(process.env.OTP_TTL));

        // 5. Create resend cooldown
        await redis.set(
            `otp_resend:${channelId}`,
            "true",
            "EX",
            Number(process.env.RESEND_TTL)
        );

        // Reset attempt count on new OTP
        await redis.del(`otp_attempt:${channelId}`);

        // 6. Send OTP via appropriate channel
        if (channelType === CHANNEL_TYPE.PHONE) {
            // TODO:- Remove hardcoded phone number and use channelId instead after testing
            // await sendOtpToPhone("+91" + channelId, otp);
        } else {
            // await sendOtpToEmail(channelId, otp);
        }

        // 7. Increment resend count (only for resends), with a rolling 1-hour
        // window so the limit recovers automatically and never locks out forever.
        if (countsAsResend) {
            const total = await redis.incr(countKey);
            if (total === 1) {
                await redis.expire(countKey, 3600);
            }
        }

        return ServiceResponse.success({
            message: OTP_MESSAGES.OTP_SEND_SUCCESS,
        });

    } catch (err) {
        console.error(`Error in send OTP for channel ${channelId}:`, err);
        await redis.del(`otp:${channelId}`);
        await redis.del(`otp_attempt:${channelId}`);
        errorLogger.error(err);
        return ServiceResponse.error({
            message: OTP_MESSAGES.OTP_GENERATION_FAILED,
            statusCode: 500
        });
    }
};

const verifyOTP = async (channelId, enteredOTP) => {
    try {
        // 1. Check blocked
        const blocked = await redis.get(`otp_block:${channelId}`);

        if (blocked) {
            return ServiceResponse.error({ message: OTP_MESSAGES.BLOCKED, statusCode: 403 });
        }

        // 2. Get stored OTP
        const savedOTP = await redis.get(`otp:${channelId}`);;

        if (!savedOTP) {
            return ServiceResponse.error({ message: "OTP expired", statusCode: 400 });
        }

        // 3. Compare OTP
        if (savedOTP !== enteredOTP) {

            // Increase attempt count
            const attempts = await redis.incr(`otp_attempt:${channelId}`);;

            // Set expiry only on first wrong attempt
            if (attempts === 1) {
                await redis.expire(
                    `otp_attempt:${channelId}`,
                    Number(process.env.OTP_TTL)
                );
            }

            // Block after max attempts
            if (attempts >= Number(process.env.MAX_ATTEMPTS)) {

                // Block user for 1 hour
                await redis.set(
                    `otp_block:${channelId}`,
                    "true",
                    "EX",
                    3600
                );

                // Cleanup
                await redis.del(`otp:${channelId}`);
                await redis.del(`otp_attempt:${channelId}`);

                return ServiceResponse.error({ message: OTP_MESSAGES.BLOCKED, statusCode: 403 });
            }

            return ServiceResponse.error({ message: `Invalid OTP. Attempts left: ${Number(process.env.MAX_ATTEMPTS) - attempts}`, statusCode: 400 });
        }

        // Success cleanup
        await redis.del(`otp:${channelId}`);
        await redis.del(`otp_resend:${channelId}`);
        await redis.del(`otp_attempt:${channelId}`);

        return ServiceResponse.success({
            message: OTP_MESSAGES.OTP_VERIFY_SUCCESS,
            statusCode: 200
        });

    } catch (err) {
        console.error(`Error in verifyOTP for channel ${channelId}:`, err);
        errorLogger.error(err);
        return ServiceResponse.error({
            message: OTP_MESSAGES.OTP_VERIFICATION_FAILED,
            statusCode: 500
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
};
