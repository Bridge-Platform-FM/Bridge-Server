'use strict';
const { applicationLogger } = require('../configs/logger');

/**
 * Prints email and mobile OTPs to console and log files.
 */
const printOtp = (email, emailOtp, phoneNumber, mobileOtp) => {
    const emailLog = `EMAIL OTP for ${email} : ${emailOtp}`;
    const mobileLog = `MOBILE OTP for ${phoneNumber} : ${mobileOtp}`;
    
    console.info(emailLog);
    console.info(mobileLog);

    applicationLogger.info(`OTP GENERATION - ${emailLog} | ${mobileLog}`);
};

/**
 * Prints a single channel OTP (e.g. on resend) to console and log files.
 */
const printSingleOtp = (channel, recipient, otp) => {
    const logMsg = `${channel.toUpperCase()} OTP for ${recipient} : ${otp}`;
    console.info(logMsg);
    applicationLogger.info(`OTP RESEND - ${logMsg}`);
};

module.exports = {
    printOtp,
    printSingleOtp
};
