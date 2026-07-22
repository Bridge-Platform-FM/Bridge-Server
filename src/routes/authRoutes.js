'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
    validate,
    companyRegistrationSchema,
    verifyOtpSchema,
    resendOtpSchema,
    refreshTokenSchema,
    loginSchema,
    resetPasswordSchema
} = require('../validations/authValidation');
const authMiddleware = require('../middleware/authMiddleware');
const mfaMiddleware = require('../middleware/mfaMiddleware');
const resetPasswordMiddleware = require('../middleware/resetPasswordMiddleware');


// Route for starting Company registration and generating OTPs
router.post('/company-registration', validate(companyRegistrationSchema), authController.companyRegistration);

// Route for verifying a single channel OTP
router.post('/verify-otp', authMiddleware, validate(verifyOtpSchema), authController.verifyOtp);

// Route for resending an OTP for a channel
router.post('/resend-otp', authMiddleware, validate(resendOtpSchema), authController.resendOtp);

// Route for updating access tokens via refresh tokens
router.post('/refresh', validate(refreshTokenSchema), authController.updateAccessToken);

// Route for company login
router.post('/login', validate(loginSchema), authController.login);

// MFA routes accept ONLY the short-lived MFA-pending token from login.
router.post('/mfa/trigger-otp', mfaMiddleware, authController.triggerOtp);

router.post('/mfa/verify-otp', mfaMiddleware, authController.verifyMfaOtp);

router.post('/mfa/resend-otp', mfaMiddleware, authController.resendMfaOtp);

router.post('/reset-password/trigger-otp', authController.resetPasswordTriggerOtp);

router.post('/reset-password/verify-otp', authController.resetPasswordVerifyOtp);

router.post('/reset-password', resetPasswordMiddleware, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
