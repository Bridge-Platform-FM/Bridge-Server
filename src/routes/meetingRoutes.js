'use strict';

const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');
const { createMeetingSchema, updateMeetingSchema, validate } = require('../validations/meetingValidation');

// POST /api/v1/meetings
// Create a new meeting. Meeting is confirmed immediately upon creation.
router.post(
    '/',
    authMiddleware,
    validate(createMeetingSchema),
    meetingController.createMeeting
);

// GET /api/v1/meetings/upcoming?dealRoomId=1
// Returns the single nearest upcoming meeting for the specified deal room.
router.get('/upcoming', authMiddleware, meetingController.getUpcomingMeeting);

// GET /api/v1/meetings/detail?meetingId=1
// Returns full details of a single meeting.
router.get('/detail', authMiddleware, meetingController.getMeetingById);

// GET /api/v1/meetings?dealRoomId=1
// Returns ALL meetings (past + upcoming) for the specified deal room.
router.get('/', authMiddleware, meetingController.getMeetingsByDealRoom);

// PUT /api/v1/meetings/update?meetingId=1
// Updates meeting details. At least one field must be provided.
router.put(
    '/update',
    authMiddleware,
    validate(updateMeetingSchema),
    meetingController.updateMeeting
);

module.exports = router;