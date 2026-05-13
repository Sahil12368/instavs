const mongoose = require('mongoose');

/**
 * Instagram Account Schema
 * Stores connected Instagram business account details and tokens
 */
const instagramAccountSchema = new mongoose.Schema({
  // Instagram Business Account ID
  instagramAccountId: {
    type: String,
    required: true,
    unique: true
  },

  // Instagram Business Account username
  username: {
    type: String,
    required: true
  },

  // Full name / profile name
  name: {
    type: String,
    default: ''
  },

  // Profile picture URL
  profilePictureUrl: {
    type: String,
    default: ''
  },

  // Meta Long-lived Access Token
  accessToken: {
    type: String,
    required: true
  },

  // Token expiry timestamp
  tokenExpiresAt: {
    type: Date,
    default: null
  },

  // Whether the account is connected and active
  isConnected: {
    type: Boolean,
    default: true
  },

  // Connection timestamps
  connectedAt: {
    type: Date,
    default: Date.now
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InstagramAccount', instagramAccountSchema);
