const crypto = require('crypto');
const autoReplyService = require('../services/autoReplyService');
const socketService = require('../services/socketService');

/**
 * Instagram Webhook Handler
 * Processes incoming webhook events from Meta
 */

/**
 * Verify Meta's X-Hub-Signature-256 header against the raw request body.
 * Returns true if the signature is valid or if verification is disabled.
 */
function verifySignature(req) {
  // Allow opting out during local development / webhook test tools.
  if (process.env.SKIP_WEBHOOK_VERIFY === 'true') return true;

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.warn(
      '⚠️  META_APP_SECRET not set — skipping webhook signature check'
    );
    return true;
  }

  const signature = req.header('x-hub-signature-256');

  // Verbose debug so we can see exactly what Meta sent us
  console.log('🔐 sig-debug', {
    hasSignatureHeader: !!signature,
    signatureHeader: signature,
    hasRawBody: !!req.rawBody,
    rawBodyLength: req.rawBody?.length,
    appSecretLength: appSecret.length,
    appSecretPreview:
      appSecret.slice(0, 3) + '...' + appSecret.slice(-3)
  });

  if (!signature || !req.rawBody) return false;

  const expected =
    'sha256=' +
    crypto.createHmac('sha256', appSecret).update(req.rawBody).digest('hex');

  console.log('🔐 sig-compare', { received: signature, computed: expected });

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Verify webhook token (Meta sends this during webhook setup)
 * Meta expects us to return the 'hub.challenge' value if 'hub.verify_token' matches
 */
function verifyWebhook(req, res) {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.META_WEBHOOK_TOKEN) {
        console.log('✅ Webhook verified successfully!');
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }

    return res.sendStatus(400);
  } catch (error) {
    console.error('Webhook verification error:', error);
    return res.sendStatus(500);
  }
}

/**
 * Handle incoming webhook events
 * This is where Instagram sends us comments, DMs, etc.
 */
async function handleWebhookEvents(req, res) {
  try {
    // Reject requests that can't be authenticated
    if (!verifySignature(req)) {
      console.warn('❌ Rejected webhook with invalid signature');
      return res.sendStatus(403);
    }

    const { body } = req;
    console.log(
      '📩 Webhook event received:',
      JSON.stringify(body).substring(0, 500)
    );

    if (body.object === 'instagram') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          await processChange(change);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('Error handling webhook event:', error);
    // Always return 200 to Meta so it doesn't retry indefinitely on app bugs
    return res.status(200).send('EVENT_RECEIVED');
  }
}

/**
 * Process a single webhook change event
 */
async function processChange(change) {
  try {
    const { field, value } = change;

    switch (field) {
      case 'comments':
        await handleCommentEvent(value);
        break;

      case 'messages':
        await handleMessageEvent(value);
        break;

      default:
        console.log(`⚠️ Unknown webhook field: ${field}`);
    }
  } catch (error) {
    console.error('Error processing change:', error.message);
  }
}

/**
 * Handle Instagram comment events
 */
async function handleCommentEvent(value) {
  console.log(`💬 Comment from ${value.from?.username}: "${value.text}"`);

  const message = await autoReplyService.processIncomingComment(value);

  if (message) {
    socketService.emitNewMessage(message);
  }
}

/**
 * Handle Instagram message (DM) events
 */
async function handleMessageEvent(value) {
  console.log(`✉️ DM from ${value.from?.username}: "${value.text}"`);

  const message = await autoReplyService.processIncomingDM(value);

  if (message) {
    socketService.emitNewMessage(message);
  }
}

module.exports = {
  verifyWebhook,
  handleWebhookEvents
};
