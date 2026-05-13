const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Auth Routes
 * Handles Instagram OAuth authentication
 */

// Step 1: Get OAuth URL to start the connection
router.get('/instagram', authController.initiateOAuth);

// Step 2: Handle the OAuth callback from Meta
router.get('/instagram/callback', authController.handleOAuthCallback);

// Get connection status
router.get('/instagram/status', authController.getConnectionStatus);

// Disconnect Instagram account
router.post('/instagram/disconnect', authController.disconnectAccount);

module.exports = router;
