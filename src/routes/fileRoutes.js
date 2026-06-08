'use strict';
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const { picUpload, fileUpload } = require('../configs/scan');

// File scan for Img and Pdf
router.post('/scan-img', picUpload.single("image"), fileController.scanFile);
router.post('/scan-document', fileUpload.single("document"), fileController.scanFile);

// file preview
// TODO: Add authmiddleware
router.get('/file-preview', fileController.filePreview);

module.exports = router