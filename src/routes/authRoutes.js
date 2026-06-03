'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
    validate,
    companyRegistrationSchema,
    verifyOtpSchema,
    resendOtpSchema,
    refreshTokenSchema
} = require('../validations/authValidation');
const authMiddleware = require('../middleware/authMiddleware');

// Route for starting Company registration and generating OTPs
router.post('/company-registration', validate(companyRegistrationSchema), authController.companyRegistration);

// Route for verifying a single channel OTP
router.post('/verify-otp', authMiddleware, validate(verifyOtpSchema), authController.verifyOtp);

// Route for resending an OTP for a channel
router.post('/resend-otp', authMiddleware, validate(resendOtpSchema), authController.resendOtp);

// Route for updating access tokens via refresh tokens
router.post('/refresh', validate(refreshTokenSchema), authController.updateAccessToken);

module.exports = router;
