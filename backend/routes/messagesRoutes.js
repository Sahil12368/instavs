const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

/**
 * Messages Routes
 * Retrieving stored messages and statistics
 */

// GET all messages (with optional type filter)
router.get('/', messagesController.getAllMessages);

// GET message statistics
router.get('/stats', messagesController.getMessageStats);

// GET single message
router.get('/:id', messagesController.getMessageById);

module.exports = router;
