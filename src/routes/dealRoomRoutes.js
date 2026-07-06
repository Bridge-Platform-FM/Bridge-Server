'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dealRoomController = require('../controllers/dealRoomController');
const { validate, closeDealRoomSchema } = require('../validations/dealRoomValidation');

// GET /api/v1/deal-rooms — list all deal rooms for the logged in user
router.get('/', authMiddleware, dealRoomController.getDealRooms);

// PUT /api/v1/deal-rooms/:dealRoomId/close — close a deal room
router.put('/:dealRoomId/close', authMiddleware, validate(closeDealRoomSchema), dealRoomController.closeDealRoom);

module.exports = router;
