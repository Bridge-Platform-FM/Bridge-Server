'use strict';

/**
 * Prints email and mobile OTPs to console and log files.
 */
const printOtp = (email, emailOtp, phoneNumber, mobileOtp) => {
    const emailLog = `EMAIL OTP for ${email} : ${emailOtp}`;
    const mobileLog = `MOBILE OTP for ${phoneNumber} : ${mobileOtp}`;

    console.info(emailLog);
    console.info(mobileLog);


};

/**
 * Prints a single channel OTP (e.g. on resend) to console and log files.
 */
const printSingleOtp = (channel, recipient, otp) => {
    const logMsg = `${channel.toUpperCase()} OTP for ${recipient} : ${otp}`;
    console.info(logMsg);

};

// Generates a random 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = {
    printOtp,
    printSingleOtp,
    generateOTP
};
