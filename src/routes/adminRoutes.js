'use strict';
const express = require('express');
const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');
const adminMfaMiddleware = require('../middleware/adminMfaMiddleware');
const authorize = require('../middleware/authorize');
const adminController = require('../controllers/adminController');
const faqController = require('../controllers/faqController');
const { PERMISSIONS } = require('../utils/constant');
const { PERMISSIONS } = require('../utils/constant');

// File scan for Img and Pdf
router.post('/auth/login', adminController.login);

router.post('/auth/mfa/trigger-otp', adminMiddleware, adminController.triggerOtp);

router.post('/auth/mfa/verify-otp', adminMfaMiddleware, authorize(PERMISSIONS.ADMIN_AUTH.MFA_VERIFY_OTP), adminController.verifyMfaOtp);

router.post('/auth/mfa/resend-otp', adminMfaMiddleware, authorize(PERMISSIONS.ADMIN_AUTH.MFA_RESEND_OTP), adminController.resendMfaOtp);

router.get('/get-user-list', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER.LIST), adminController.getUserList);
router.get('/get-user-list', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER.LIST), adminController.getUserList);

router.get('/get-user-kyc_docs', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER.VIEW_KYC_DOCS), adminController.getUserKycDocs);
router.get('/get-user-kyc_docs', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER.VIEW_KYC_DOCS), adminController.getUserKycDocs);

router.put('/kyc/document-action', adminMiddleware, authorize(PERMISSIONS.ADMIN_KYC.DOCUMENT_ACTION), adminController.kycDocumentAction);
router.put('/kyc/document-action', adminMiddleware, authorize(PERMISSIONS.ADMIN_KYC.DOCUMENT_ACTION), adminController.kycDocumentAction);

router.put('/kyc/review-action', adminMiddleware, authorize(PERMISSIONS.ADMIN_KYC.REVIEW_ACTION), adminController.kycReviewAction);
router.put('/kyc/review-action', adminMiddleware, authorize(PERMISSIONS.ADMIN_KYC.REVIEW_ACTION), adminController.kycReviewAction);

// User limit config
router.get('/users/:userId/limit-config', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER_LIMIT.VIEW), adminController.getUserLimitConfig);
router.get('/users/:userId/limit-config', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER_LIMIT.VIEW), adminController.getUserLimitConfig);

router.put('/users/:userId/limit-config', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER_LIMIT.UPDATE), adminController.updateUserLimitConfig);
router.put('/users/:userId/limit-config', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER_LIMIT.UPDATE), adminController.updateUserLimitConfig);

// FAQ management
router.get('/faqs', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.LIST), faqController.getAllFaqsForAdmin);
router.get('/faqs', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.LIST), faqController.getAllFaqsForAdmin);

router.post('/faqs', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.CREATE), faqController.createFaq);
router.post('/faqs', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.CREATE), faqController.createFaq);

router.put('/faqs/:id', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.UPDATE), faqController.updateFaq);
router.put('/faqs/:id', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.UPDATE), faqController.updateFaq);

module.exports = router;