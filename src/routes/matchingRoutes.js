'use strict';

const express = require('express');
const router = express.Router();
const matchingController = require('../matching/matchingController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/v1/matching/profiles — get ranked matches for a profile
router.get('/profiles', authMiddleware, matchingController.getMatches);

module.exports = router;
