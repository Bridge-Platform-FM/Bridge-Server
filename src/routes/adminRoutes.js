'use strict';
const express = require('express');
const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');
const adminMfaMiddleware = require('../middleware/adminMfaMiddleware');
const authorize = require('../middleware/authorize');
const adminController = require('../controllers/adminController');
const faqController = require('../controllers/faqController');
const adminConfigController = require('../controllers/adminConfigController');
const adminManagementRoutes = require('./adminManagementRoutes');
const { PERMISSIONS } = require('../utils/constant');

// File scan for Img and Pdf
router.post('/auth/login', adminController.login);

router.post('/auth/mfa/trigger-otp', adminMfaMiddleware, authorize(PERMISSIONS.ADMIN_AUTH.MFA_TRIGGER_OTP), adminController.triggerOtp);

router.post('/auth/mfa/verify-otp', adminMfaMiddleware, authorize(PERMISSIONS.ADMIN_AUTH.MFA_VERIFY_OTP), adminController.verifyMfaOtp);

router.post('/auth/mfa/resend-otp', adminMfaMiddleware, authorize(PERMISSIONS.ADMIN_AUTH.MFA_RESEND_OTP), adminController.resendMfaOtp);

router.post('/auth/logout', adminMiddleware, authorize(PERMISSIONS.SESSION.LOGOUT), adminController.logout);

router.get('/get-user-list', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER.LIST), adminController.getUserList);

router.get('/get-user-kyc_docs', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER.VIEW_KYC_DOCS), adminController.getUserKycDocs);

router.put('/kyc/document-action', adminMiddleware, authorize(PERMISSIONS.ADMIN_KYC.DOCUMENT_ACTION), adminController.kycDocumentAction);

router.put('/kyc/review-action', adminMiddleware, authorize(PERMISSIONS.ADMIN_KYC.REVIEW_ACTION), adminController.kycReviewAction);

// User limit config
router.get('/users/:userId/limit-config', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER_LIMIT.VIEW), adminController.getUserLimitConfig);

router.put('/users/:userId/limit-config', adminMiddleware, authorize(PERMISSIONS.ADMIN_USER_LIMIT.UPDATE), adminController.updateUserLimitConfig);

// FAQ management
router.get('/faqs', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.LIST), faqController.getAllFaqsForAdmin);

router.post('/faqs', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.CREATE), faqController.createFaq);

router.put('/faqs/:id', adminMiddleware, authorize(PERMISSIONS.ADMIN_FAQ.UPDATE), faqController.updateFaq);

// Matching Engine Dashboard
// TODO: add permission for this route
router.get('/matching-engine/stats', adminMiddleware, adminController.getMatchingEngineStats);

// Super Admin — Admin Management
router.use('/management', adminManagementRoutes);


module.exports = router;