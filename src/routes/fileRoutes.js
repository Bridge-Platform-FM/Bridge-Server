'use strict';
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const { picUpload, fileUpload } = require('../configs/scan');

// File scan for Img and Pdf
router.post('/scan-img', authMiddleware, picUpload.single("image"), fileController.scanFile);
router.post('/scan-document', authMiddleware, fileUpload.single("document"), fileController.scanFile);
router.post('/save-kyc-info', authMiddleware, fileController.saveKycInfo);
// file preview
// TODO: Add authmiddleware
router.get('/file-preview', authMiddleware, fileController.filePreview);

module.exports = router