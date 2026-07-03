'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dealRoomController = require('../controllers/dealRoomController');

// GET /api/v1/deal-rooms — list all deal rooms for the logged in user
router.get('/', authMiddleware, dealRoomController.getDealRooms);

module.exports = router;
