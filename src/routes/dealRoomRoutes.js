'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dealRoomController = require('../controllers/dealRoomController');
const dealRoomOfferController = require('../controllers/dealRoomOfferController');
const dealRoomTermSheetController = require('../controllers/dealRoomTermSheetController');
const dealRoomExportController = require('../controllers/dealRoomExportController');
const { validate, closeDealRoomSchema } = require('../validations/dealRoomValidation');

// GET /api/v1/deal-rooms?archived=true — list deal rooms for the logged in user (active by default, archived if ?archived=true)
router.get('/', authMiddleware, dealRoomController.getDealRooms);

// PUT /api/v1/deal-rooms/:dealRoomId/close — close a deal room
router.put('/:dealRoomId/close', authMiddleware, validate(closeDealRoomSchema), dealRoomController.closeDealRoom);

// PUT /api/v1/deal-rooms/:dealRoomId/archive — archive a deal room (caller's own view only)
router.put('/:dealRoomId/archive', authMiddleware, dealRoomController.archiveDealRoom);

// PUT /api/v1/deal-rooms/:dealRoomId/unarchive — unarchive a deal room (caller's own view only)
router.put('/:dealRoomId/unarchive', authMiddleware, dealRoomController.unarchiveDealRoom);

// GET /api/v1/deal-rooms/:dealRoomId/stage-request/pending — the room's currently pending stage request (if any)
router.get('/:dealRoomId/stage-request/pending', authMiddleware, dealRoomController.getPendingStageUpdate);


// GET /api/v1/deal-rooms/:dealRoomId/term-sheet/current — the room's latest B2B term sheet version
router.get('/:dealRoomId/term-sheet/current', authMiddleware, dealRoomTermSheetController.getCurrentTermSheet);

// GET /api/v1/deal-rooms/:dealRoomId/term-sheet/history — every saved B2B term sheet version
router.get('/:dealRoomId/term-sheet/history', authMiddleware, dealRoomTermSheetController.getTermSheetHistory);

// GET /api/v1/deal-rooms/:dealRoomId/offers — full funding offer negotiation thread
router.get('/:dealRoomId/offers', authMiddleware, dealRoomOfferController.getOfferThread);

// GET /api/v1/deal-rooms/:dealRoomId/offers/all — every negotiation thread ever started in this room
router.get('/:dealRoomId/offers/all', authMiddleware, dealRoomOfferController.getAllOffers);

// GET /api/v1/deal-rooms/:dealRoomId/offers/current — latest offer in the thread
router.get('/:dealRoomId/offers/current', authMiddleware, dealRoomOfferController.getCurrentOffer);

// GET /api/v1/deal-rooms/:dealRoomId/offers/draft — caller's own unsent draft, if any
router.get('/:dealRoomId/offers/draft', authMiddleware, dealRoomOfferController.getDraft);

// GET /api/v1/deal-rooms/:dealRoomId/export — download chats + media as a stage-organized zip
router.get('/:dealRoomId/export', authMiddleware, dealRoomExportController.exportDealRoom);

module.exports = router;
