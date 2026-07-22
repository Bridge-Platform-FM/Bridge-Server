'use strict';

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const subscriptionController = require('../controllers/subscriptionController');

// GET /api/v1/subscriptions/plans — list all active plans (requires valid JWT)
router.get('/plans', authMiddleware, subscriptionController.getPlans);

// POST /api/v1/subscriptions/select — select a plan for the authenticated user
// Body: { plan_id: number }
router.post('/select', authMiddleware, subscriptionController.selectPlan);

// GET /api/v1/subscriptions/my — fetch the authenticated user's active subscription
router.get('/my', authMiddleware, subscriptionController.getUserSubscription);

module.exports = router;