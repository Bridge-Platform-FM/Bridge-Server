'use strict';
const express = require('express');
const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');
const adminMfaMiddleware = require('../middleware/adminMfaMiddleware');
const adminController = require('../controllers/adminController');
const faqController = require('../controllers/faqController');

// File scan for Img and Pdf
router.post('/auth/login', adminController.login);

// MFA steps are gated by the short-lived mfa_token, not the full access token.
router.post('/auth/mfa/trigger-otp', adminMfaMiddleware, adminController.triggerOtp);

router.post('/auth/mfa/verify-otp', adminMfaMiddleware, adminController.verifyMfaOtp);

router.post('/auth/mfa/resend-otp', adminMfaMiddleware, adminController.resendMfaOtp);

router.get('/get-user-list', adminMiddleware, adminController.getUserList);

router.get('/get-user-kyc_docs', adminMiddleware, adminController.getUserKycDocs);

router.put('/kyc/document-action', adminMiddleware, adminController.kycDocumentAction);

router.put('/kyc/review-action', adminMiddleware, adminController.kycReviewAction);

// User limit config
router.get('/users/:userId/limit-config', adminMiddleware, adminController.getUserLimitConfig);

router.put('/users/:userId/limit-config', adminMiddleware, adminController.updateUserLimitConfig);

// FAQ management
router.get('/faqs', adminMiddleware, faqController.getAllFaqsForAdmin);

router.post('/faqs', adminMiddleware, faqController.createFaq);

router.put('/faqs/:id', adminMiddleware, faqController.updateFaq);

module.exports = router;