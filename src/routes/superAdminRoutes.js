'use strict';
const express = require('express');
const router = express.Router();

const adminConfigController = require('../controllers/adminConfigController');
const adminMiddleware = require('../middleware/adminMiddleware');
const authorize = require('../middleware/authorize');
const { PERMISSIONS } = require('../utils/constant');

router.get('/config/otp-config', adminMiddleware, authorize(PERMISSIONS.ADMIN_CONFIG.VIEW_OTP_CONFIG), adminConfigController.getOtpConfig);

router.put('/config/otp-config', adminMiddleware, authorize(PERMISSIONS.ADMIN_CONFIG.UPDATE_OTP_CONFIG), adminConfigController.updateOtpConfig);

module.exports = router;