'use strict';
const express = require('express');
const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// File scan for Img and Pdf
router.post('/auth/login', adminController.login);

router.post('/auth/mfa/trigger-otp', adminMiddleware, adminController.triggerOtp);

router.post('/auth/mfa/verify-otp', adminMiddleware, adminController.verifyMfaOtp);

router.post('auth/mfa/resend-otp', adminMiddleware, adminController.resendMfaOtp);

router.get('/get-user-list', adminMiddleware, adminController.getUserList);

router.get('/get-user-kyc_docs', adminMiddleware, adminController.getUserKycDocs);

router.put('/kyc/document-action', adminMiddleware, adminController.kycDocumentAction);

router.put('/kyc/review-action', adminMiddleware, adminController.kycReviewAction);

module.exports = router;