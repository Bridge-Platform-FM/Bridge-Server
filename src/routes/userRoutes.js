'use strict';
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/v1/users — create a user profile (requires valid JWT)
router.post('/build-profile', authMiddleware, userController.createUserProfile);

// GET /api/v1/users/profile — get user profile structure with editability configs
router.get('/profile', authMiddleware, userController.getUserProfile);

router.put('/profile', authMiddleware, userController.updateUserProfile);

module.exports = router;
