'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const connectionController = require('../controllers/connectionController');
const { validate, sendConnectionRequestSchema, changeStatusSchema } = require('../validations/connectionValidation');

// POST /api/v1/connections — send a connection request
router.post('/', authMiddleware, validate(sendConnectionRequestSchema), connectionController.sendConnectionRequest);

// PUT /api/v1/connections/change-status — change status of a connection request
router.put('/change-status', authMiddleware, validate(changeStatusSchema), connectionController.changeConnectionStatus);

// GET /api/v1/connections/sent — connection requests sent by logged in user
router.get('/sent', authMiddleware, connectionController.getSentConnections);

// GET /api/v1/connections/received — connection requests received by logged in user
router.get('/received', authMiddleware, connectionController.getReceivedConnections);

module.exports = router;
