'use strict';

const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');
const { createMeetingSchema, updateMeetingSchema, validate } = require('../validations/meetingValidation');

// POST /api/v1/meetings
// Create a new meeting. Meeting is confirmed immediately upon creation.
// dealRoomId and recipientUserId are required in the request body.
router.post(
    '/',
    authMiddleware,
    validate(createMeetingSchema),
    meetingController.createMeeting
);

// IMPORTANT: Static sub-paths (/upcoming) must be declared BEFORE the dynamic
// /:meetingId route, otherwise Express matches "upcoming" as a meetingId value.

// GET /api/v1/meetings/upcoming?dealRoomId=X
// Returns the single nearest upcoming meeting for the specified deal room.
// Used for the "upcoming meeting" notification widget inside the deal room UI.
// Returns data: null if no upcoming meetings exist for that deal room.
router.get('/upcoming', authMiddleware, meetingController.getUpcomingMeeting);

// GET /api/v1/meetings?dealRoomId=X
// Returns ALL meetings (past + upcoming) for the specified deal room, sorted ASC by scheduled_at.
router.get('/', authMiddleware, meetingController.getMeetingsByDealRoom);

// GET /api/v1/meetings/:meetingId
// Returns full details of a single meeting. Only accessible to its two participants.
router.get('/:meetingId', authMiddleware, meetingController.getMeetingById);

// PUT /api/v1/meetings/:meetingId
// Updates meeting details. At least one field must be provided.
// Both participants (requester and recipient) can update.
// If scheduledAt is updated, it must be a future date.
router.put(
    '/:meetingId',
    authMiddleware,
    validate(updateMeetingSchema),
    meetingController.updateMeeting
);

module.exports = router;