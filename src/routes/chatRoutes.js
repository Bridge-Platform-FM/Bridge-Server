'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');
const { chatMediaUpload } = require('../configs/scan');
const { validate, sendMediaMessageSchema } = require('../validations/chatValidation');

// GET /api/v1/deal-rooms/:dealRoomId/messages — paginated message history
router.get('/', authMiddleware, chatController.getMessages);

// PUT /api/v1/deal-rooms/:dealRoomId/messages/read — mark messages as read
router.put('/read', authMiddleware, chatController.markRead);

// POST /api/v1/deal-rooms/:dealRoomId/messages/media — upload an image/document/audio/video message
router.post('/media', authMiddleware, chatMediaUpload.single('media'), validate(sendMediaMessageSchema), chatController.uploadMedia);

// GET /api/v1/deal-rooms/:dealRoomId/messages/:messageId/media — stream a previously uploaded attachment
router.get('/:messageId/media', authMiddleware, chatController.getMedia);

module.exports = router;
