'use strict';
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const userSessionController = require('../controllers/userSessionController');

/*
 * ROUTE ORDERING MATTERS — all named routes (/logout, /logout-all,
 * /limit-status, /revoke-selected) must come BEFORE /:sessionId.
 * Express matches top-to-bottom; /:sessionId would otherwise swallow
 * those string paths as param values.
 */

// GET  /api/v1/sessions
router.get('/', authenticate, userSessionController.getActiveSessions);

// GET  /api/v1/sessions/limit-status
router.get('/limit-status', authenticate, userSessionController.getSessionLimitStatus);

// POST /api/v1/sessions/logout  — sidebar Logout button (current device only)
router.post('/logout', authenticate, userSessionController.logoutCurrentSession);

// POST /api/v1/sessions/logout-all  — revoke every session for this user
router.post('/logout-all', authenticate, userSessionController.logoutAllSessions);

// POST /api/v1/sessions/revoke-selected  — device-chooser modal selection
router.post('/revoke-selected', authenticate, userSessionController.revokeSelectedSessions);

// DELETE /api/v1/sessions/:sessionId  — revoke one specific session by id
router.delete('/:sessionId', authenticate, userSessionController.revokeSession);

module.exports = router;

/**
 * Mounted in app.js as:
 *   app.use('/api/v1/sessions', userSessionRoutes);
 *
 * Full endpoint list:
 *   GET    /api/v1/sessions
 *   GET    /api/v1/sessions/limit-status
 *   POST   /api/v1/sessions/logout
 *   POST   /api/v1/sessions/logout-all
 *   POST   /api/v1/sessions/revoke-selected
 *   DELETE /api/v1/sessions/:sessionId
 */