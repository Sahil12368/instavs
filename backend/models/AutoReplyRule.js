const mongoose = require('mongoose');

/**
 * Auto Reply Rule Schema
 * Stores automation rules for keyword-based replies
 */
const autoReplyRuleSchema = new mongoose.Schema({
  // Type of message to listen to: 'comment' or 'dm'
  type: {
    type: String,
    enum: ['comment', 'dm'],
    required: [true, 'Rule type is required (comment or dm)']
  },

  // Keyword to trigger the reply (case-insensitive match)
  keyword: {
    type: String,
    required: [true, 'Keyword is required'],
    trim: true,
    lowercase: true
  },

  // The auto reply message text
  replyText: {
    type: String,
    required: [true, 'Reply text is required'],
    trim: true
  },

  // Whether the rule is active
  isActive: {
    type: Boolean,
    default: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
autoReplyRuleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AutoReplyRule', autoReplyRuleSchema);
