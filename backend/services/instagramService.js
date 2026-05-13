const axios = require('axios');
const InstagramAccount = require('../models/InstagramAccount');

/**
 * Instagram API Service
 * Handles all interactions with Meta's Graph API for Instagram
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

/**
 * Exchange short-lived token for a long-lived token (60 days)
 */
async function exchangeForLongLivedToken(shortLivedToken) {
  try {
    const response = await axios.get(`${GRAPH_API_BASE}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: shortLivedToken
      }
    });

    const { access_token, expires_in } = response.data;

    // Calculate expiry date (expires_in is in seconds)
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    return {
      accessToken: access_token,
      expiresAt
    };
  } catch (error) {
    console.error('Error exchanging for long-lived token:', error.response?.data || error.message);
    throw new Error('Failed to exchange for long-lived token');
  }
}

/**
 * Get Instagram Business Account details
 */
async function getInstagramBusinessAccount(accessToken) {
  try {
    // First, get the user's Facebook Pages
    const pagesResponse = await axios.get(`${GRAPH_API_BASE}/me/accounts`, {
      params: {
        access_token: accessToken
      }
    });

    if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
      throw new Error('No Facebook Pages found. You need a Facebook Page connected to Instagram.');
    }

    // Get the first page (you can modify this to handle multiple pages)
    const page = pagesResponse.data.data[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;

    // Now get the Instagram Business Account connected to this page
    const instagramResponse = await axios.get(`${GRAPH_API_BASE}/${pageId}`, {
      params: {
        fields: 'instagram_business_account',
        access_token: pageAccessToken
      }
    });

    if (!instagramResponse.data.instagram_business_account) {
      throw new Error('No Instagram Business Account connected to this Facebook Page.');
    }

    const igAccountId = instagramResponse.data.instagram_business_account.id;

    // Get Instagram account details
    const igDetailsResponse = await axios.get(`${GRAPH_API_BASE}/${igAccountId}`, {
      params: {
        fields: 'id,username,name,profile_picture_url',
        access_token: pageAccessToken
      }
    });

    return {
      instagramAccountId: igDetailsResponse.data.id,
      username: igDetailsResponse.data.username,
      name: igDetailsResponse.data.name || '',
      profilePictureUrl: igDetailsResponse.data.profile_picture_url || '',
      accessToken: pageAccessToken
    };
  } catch (error) {
    console.error('Error getting Instagram account:', error.response?.data || error.message);
    throw new Error('Failed to get Instagram Business Account');
  }
}

/**
 * Reply to an Instagram comment
 */
async function replyToComment(commentId, replyText, accessToken) {
  try {
    const response = await axios.post(
      `${GRAPH_API_BASE}/${commentId}/replies`,
      {
        message: replyText
      },
      {
        params: {
          access_token: accessToken
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error replying to comment:', error.response?.data || error.message);
    throw new Error('Failed to reply to comment');
  }
}

/**
 * Send a DM to an Instagram user via the business account
 * Note: This uses the Conversations API
 */
async function sendDirectMessage(recipientId, messageText, accessToken) {
  try {
    // First get or create a conversation with the user
    const response = await axios.post(
      `${GRAPH_API_BASE}/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      {
        params: {
          access_token: accessToken
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending DM:', error.response?.data || error.message);
    throw new Error('Failed to send direct message');
  }
}

/**
 * Get stored Instagram account from database
 */
async function getStoredAccount() {
  return await InstagramAccount.findOne({ isConnected: true });
}

module.exports = {
  exchangeForLongLivedToken,
  getInstagramBusinessAccount,
  replyToComment,
  sendDirectMessage,
  getStoredAccount
};
