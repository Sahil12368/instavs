const mongoose = require('mongoose');

/**
 * Message Schema
 * Stores all incoming messages/comments from Instagram
 */
const messageSchema = new mongoose.Schema({
  // Type: 'comment' or 'dm'
  type: {
    type: String,
    enum: ['comment', 'dm'],
    required: true
  },

  // Instagram's ID for this message/comment
  instagramMessageId: {
    type: String,
    required: true,
    unique: true
  },

  // Instagram user who sent the message
  fromUsername: {
    type: String,
    required: true
  },
  fromUserId: {
    type: String,
    required: true
  },

  // The message text content
  text: {
    type: String,
    required: true
  },

  // ID of the Instagram media (post) if this is a comment
  mediaId: {
    type: String,
    default: null
  },

  // Auto reply details (if one was sent)
  autoReply: {
    sent: {
      type: Boolean,
      default: false
    },
    replyText: {
      type: String,
      default: null
    },
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AutoReplyRule',
      default: null
    },
    sentAt: {
      type: Date,
      default: null
    }
  },

  // Timestamps
  receivedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
