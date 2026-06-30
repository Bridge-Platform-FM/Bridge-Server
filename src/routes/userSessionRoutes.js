'use strict';
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const userSessionController = require('../controllers/userSessionController');

router.get('/', authenticate, userSessionController.getActiveSessions);
router.delete('/:sessionId', authenticate, userSessionController.revokeSession);
router.post('/logout-all', authenticate, userSessionController.logoutAllSessions);

module.exports = router;

/**
 * Mount this exactly where the old sessionRoutes.js was mounted — only the
 * file/module name changed here, not the public path, so the frontend
 * Profile-page test you already have working keeps working unchanged:
 *
 *   const userSessionRoutes = require('./routes/userSessionRoutes');
 *   app.use('/api/v1/sessions', userSessionRoutes);
 */
