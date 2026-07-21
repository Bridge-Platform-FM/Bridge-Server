'use strict';
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { picUpload, fileUpload } = require('../configs/scan');
const { PERMISSIONS } = require('../utils/constant');

// File scan for Img and Pdf
router.post('/scan-img', authMiddleware, authorize(PERMISSIONS.FILE.SCAN_IMAGE), picUpload.single("image"), fileController.scanFile);
router.post('/scan-document', authMiddleware, authorize(PERMISSIONS.FILE.SCAN_DOCUMENT), fileUpload.single("document"), fileController.scanFile);
router.post('/save-kyc-info', authMiddleware, authorize(PERMISSIONS.FILE.SAVE_KYC_INFO), fileController.saveKycInfo);
// file preview
router.get('/file-preview', authMiddleware, authorize(PERMISSIONS.FILE.PREVIEW), fileController.filePreview);
router.get('/get-kyc-docs', authMiddleware, authorize(PERMISSIONS.FILE.GET_KYC_DOCS), fileController.getKycDocs);

module.exports = router