const instagramService = require('../services/instagramService');
const InstagramAccount = require('../models/InstagramAccount');
const socketService = require('../services/socketService');

/**
 * Auth Controller
 * Handles Instagram OAuth flow and account connection
 */

/**
 * Step 1: Redirect user to Meta OAuth dialog
 */
function initiateOAuth(req, res) {
  try {
    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.REDIRECT_URI;

    // Define the permissions we need.
    // Note: `pages_manage_metadata` and `business_management` require App Review
    // and aren't available in Development mode — we've removed them. The
    // webhook subscription is configured via the Meta dashboard, not at
    // OAuth time, so we don't need those scopes for this MVP.
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'instagram_basic',
      'instagram_manage_comments',
      'instagram_manage_messages'
    ].join(',');

    // Build the Meta OAuth URL
    const oauthUrl =
      `https://www.facebook.com/v18.0/dialog/oauth` +
      `?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&response_type=code`;

    console.log('🔗 Redirecting to Meta OAuth:', oauthUrl);
    return res.json({ oauthUrl });
  } catch (error) {
    console.error('Error initiating OAuth:', error);
    return res.status(500).json({ error: 'Failed to initiate OAuth' });
  }
}

/**
 * Step 2: Handle OAuth callback from Meta
 * Exchange the authorization code for an access token
 */
async function handleOAuthCallback(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    console.log('📞 OAuth callback received with code');

    // Exchange authorization code for short-lived access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token` +
      `?client_id=${process.env.META_APP_ID}` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
      `&code=${code}`
    );
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      const msg =
        tokenData?.error?.message ||
        tokenData?.error_message ||
        'Failed to exchange code for token';
      return res.redirect(
        `${process.env.FRONTEND_URL}/?connection=error&message=${encodeURIComponent(msg)}`
      );
    }

    console.log('✅ Short-lived token obtained');

    // Exchange for long-lived token (60 days)
    const tokenInfo = await instagramService.exchangeForLongLivedToken(tokenData.access_token);

    console.log('✅ Long-lived token obtained');

    // Get Instagram Business Account details
    const igAccount = await instagramService.getInstagramBusinessAccount(tokenInfo.accessToken);

    console.log(`✅ Instagram account found: ${igAccount.username}`);

    // Save or update the account in database.
    // IMPORTANT: igAccount.accessToken is the PAGE access token, which is
    // what all downstream Graph API calls (subscribe webhooks, reply to
    // comments, send DMs) require — do NOT overwrite it with the user token.
    await InstagramAccount.findOneAndUpdate(
      { instagramAccountId: igAccount.instagramAccountId },
      {
        ...igAccount,
        tokenExpiresAt: tokenInfo.expiresAt,
        isConnected: true,
        lastSyncedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Emit connection status update via socket
    socketService.emitConnectionStatus({
      connected: true,
      username: igAccount.username,
      name: igAccount.name
    });

    console.log(`🎉 Instagram account ${igAccount.username} connected successfully!`);

    // Redirect to frontend with success
    return res.redirect(`${process.env.FRONTEND_URL}/?connection=success`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const msg = error?.message || 'OAuth callback failed';
    return res.redirect(
      `${process.env.FRONTEND_URL}/?connection=error&message=${encodeURIComponent(msg)}`
    );
  }
}

/**
 * Get the currently connected Instagram account status
 */
async function getConnectionStatus(req, res) {
  try {
    const account = await InstagramAccount.findOne({ isConnected: true });

    if (!account) {
      return res.json({
        connected: false,
        message: 'No Instagram account connected'
      });
    }

    return res.json({
      connected: true,
      username: account.username,
      name: account.name,
      profilePictureUrl: account.profilePictureUrl,
      connectedAt: account.connectedAt,
      tokenExpiresAt: account.tokenExpiresAt
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    return res.status(500).json({ error: 'Failed to get connection status' });
  }
}

/**
 * Disconnect the Instagram account
 */
async function disconnectAccount(req, res) {
  try {
    await InstagramAccount.updateMany(
      { isConnected: true },
      { isConnected: false }
    );

    socketService.emitConnectionStatus({ connected: false });

    return res.json({ message: 'Instagram account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    return res.status(500).json({ error: 'Failed to disconnect account' });
  }
}

/**
 * Manually (re)subscribe the current Page to webhooks.
 * Useful when OAuth completed but the initial auto-subscribe failed, or when
 * debugging webhook delivery.
 */
async function subscribeWebhooks(req, res) {
  try {
    const { pageId, pageName, pageAccessToken } =
      await instagramService.getPageForStoredAccount();
    const result = await instagramService.subscribePageToWebhooks(
      pageId,
      pageAccessToken
    );
    return res.json({
      message: `Page "${pageName}" subscribed to webhooks`,
      pageId,
      result
    });
  } catch (error) {
    console.error('Error subscribing webhooks:', error);
    return res
      .status(500)
      .json({ error: error.message || 'Failed to subscribe webhooks' });
  }
}

module.exports = {
  initiateOAuth,
  handleOAuthCallback,
  getConnectionStatus,
  disconnectAccount,
  subscribeWebhooks
};
