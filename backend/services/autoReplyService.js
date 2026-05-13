const AutoReplyRule = require('../models/AutoReplyRule');
const Message = require('../models/Message');
const instagramService = require('./instagramService');

/**
 * Auto Reply Service
 * Handles matching incoming messages to rules and sending auto replies
 */

/**
 * Find a matching rule for a given message text and type (comment/dm)
 */
async function findMatchingRule(text, type) {
  try {
    // Get all active rules matching the type
    const rules = await AutoReplyRule.find({ isActive: true, type });

    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();

    // Find the first rule whose keyword matches
    for (const rule of rules) {
      if (lowerText.includes(rule.keyword.toLowerCase())) {
        return rule;
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding matching rule:', error.message);
    return null;
  }
}

/**
 * Process an incoming comment and auto-reply if a rule matches
 */
async function processIncomingComment(commentData) {
  try {
    const { id, text, from, media } = commentData;

    // De-duplicate: if we've already seen this comment ID, skip it.
    // This happens on Meta retries and webhook "Test" reruns.
    const existing = await Message.findOne({ instagramMessageId: id });
    if (existing) {
      console.log(`↺ Comment ${id} already processed — skipping`);
      return existing;
    }

    // Find a matching rule
    const matchingRule = await findMatchingRule(text, 'comment');

    // Save the incoming message to database
    const message = new Message({
      type: 'comment',
      instagramMessageId: id,
      fromUsername: from?.username || 'unknown',
      fromUserId: from?.id || 'unknown',
      text: text,
      mediaId: media?.id || null
    });

    // If a matching rule was found, send auto reply
    if (matchingRule) {
      const account = await instagramService.getStoredAccount();
      if (account) {
        try {
          await instagramService.replyToComment(id, matchingRule.replyText, account.accessToken);

          // Mark the message as auto-replied
          message.autoReply = {
            sent: true,
            replyText: matchingRule.replyText,
            ruleId: matchingRule._id,
            sentAt: new Date()
          };

          console.log(`✅ Auto-replied to comment ${id} with rule "${matchingRule.keyword}"`);
        } catch (replyError) {
          console.error('Failed to send auto reply to comment:', replyError.message);
        }
      }
    }

    await message.save();
    return message;
  } catch (error) {
    // Swallow the duplicate-key race so the webhook handler still returns 200
    if (error?.code === 11000) {
      console.log('↺ Duplicate comment detected during save — ignoring');
      return null;
    }
    console.error('Error processing incoming comment:', error.message);
    throw error;
  }
}

/**
 * Process an incoming DM and auto-reply if a rule matches
 */
async function processIncomingDM(dmData) {
  try {
    const { id, text, from } = dmData;

    // De-duplicate retries
    const existing = await Message.findOne({ instagramMessageId: id });
    if (existing) {
      console.log(`↺ DM ${id} already processed — skipping`);
      return existing;
    }

    // Find a matching rule
    const matchingRule = await findMatchingRule(text, 'dm');

    // Save the incoming message to database
    const message = new Message({
      type: 'dm',
      instagramMessageId: id,
      fromUsername: from?.username || 'unknown',
      fromUserId: from?.id || 'unknown',
      text: text
    });

    // If a matching rule was found, send auto reply
    if (matchingRule) {
      const account = await instagramService.getStoredAccount();
      if (account) {
        try {
          // For DMs, we send a message back to the user
          await instagramService.sendDirectMessage(from?.id, matchingRule.replyText, account.accessToken);

          // Mark the message as auto-replied
          message.autoReply = {
            sent: true,
            replyText: matchingRule.replyText,
            ruleId: matchingRule._id,
            sentAt: new Date()
          };

          console.log(`✅ Auto-replied to DM from ${from?.username} with rule "${matchingRule.keyword}"`);
        } catch (replyError) {
          console.error('Failed to send auto reply to DM:', replyError.message);
        }
      }
    }

    await message.save();
    return message;
  } catch (error) {
    if (error?.code === 11000) {
      console.log('↺ Duplicate DM detected during save — ignoring');
      return null;
    }
    console.error('Error processing incoming DM:', error.message);
    throw error;
  }
}

module.exports = {
  findMatchingRule,
  processIncomingComment,
  processIncomingDM
};
