'use strict';

const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/v1/faqs — fetch all active FAQs (requires valid JWT)
router.get('/', authMiddleware, faqController.getFaqs);

module.exports = router;