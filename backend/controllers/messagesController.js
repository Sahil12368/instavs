const Message = require('../models/Message');

/**
 * Messages Controller
 * Handles retrieving stored messages and comments
 */

/**
 * GET /api/messages
 * Get all messages with optional filtering
 */
async function getAllMessages(req, res) {
  try {
    const { type, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (type && ['comment', 'dm'].includes(type)) {
      filter.type = type;
    }

    const messages = await Message.find(filter)
      .sort({ receivedAt: -1 })
      .limit(parseInt(limit));

    return res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

/**
 * GET /api/messages/:id
 * Get a single message by ID
 */
async function getMessageById(req, res) {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    return res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    return res.status(500).json({ error: 'Failed to fetch message' });
  }
}

/**
 * GET /api/messages/stats
 * Get message statistics
 */
async function getMessageStats(req, res) {
  try {
    const totalMessages = await Message.countDocuments();
    const totalComments = await Message.countDocuments({ type: 'comment' });
    const totalDMs = await Message.countDocuments({ type: 'dm' });
    const totalAutoReplies = await Message.countDocuments({ 'autoReply.sent': true });
    const unprocessedMessages = await Message.countDocuments({
      'autoReply.sent': false
    });

    return res.json({
      totalMessages,
      totalComments,
      totalDMs,
      totalAutoReplies,
      unprocessedMessages
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    return res.status(500).json({ error: 'Failed to fetch message stats' });
  }
}

module.exports = {
  getAllMessages,
  getMessageById,
  getMessageStats
};
