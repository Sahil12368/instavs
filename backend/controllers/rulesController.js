const AutoReplyRule = require('../models/AutoReplyRule');

/**
 * Rules Controller
 * CRUD operations for auto-reply rules
 */

/**
 * GET /api/rules
 * Get all auto-reply rules
 */
async function getAllRules(req, res) {
  try {
    const rules = await AutoReplyRule.find().sort({ createdAt: -1 });
    return res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return res.status(500).json({ error: 'Failed to fetch rules' });
  }
}

/**
 * POST /api/rules
 * Create a new auto-reply rule
 */
async function createRule(req, res) {
  try {
    const { type, keyword, replyText, isActive } = req.body;

    // Validation
    if (!type || !keyword || !replyText) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'type, keyword, and replyText are required'
      });
    }

    if (!['comment', 'dm'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type',
        details: 'type must be "comment" or "dm"'
      });
    }

    const rule = new AutoReplyRule({
      type,
      keyword: keyword.trim(),
      replyText: replyText.trim(),
      isActive: isActive !== undefined ? isActive : true
    });

    await rule.save();
    console.log(`✅ Rule created: [${type}] "${keyword}" -> "${replyText}"`);

    return res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating rule:', error);
    return res.status(500).json({ error: 'Failed to create rule' });
  }
}

/**
 * PUT /api/rules/:id
 * Update an existing auto-reply rule
 */
async function updateRule(req, res) {
  try {
    const { id } = req.params;
    const { type, keyword, replyText, isActive } = req.body;

    const rule = await AutoReplyRule.findById(id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Update only provided fields
    if (type !== undefined) {
      if (!['comment', 'dm'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }
      rule.type = type;
    }
    if (keyword !== undefined) {
      rule.keyword = keyword.trim();
    }
    if (replyText !== undefined) {
      rule.replyText = replyText.trim();
    }
    if (isActive !== undefined) {
      rule.isActive = isActive;
    }

    await rule.save();
    console.log(`✅ Rule updated: ${id}`);

    return res.json(rule);
  } catch (error) {
    console.error('Error updating rule:', error);
    return res.status(500).json({ error: 'Failed to update rule' });
  }
}

/**
 * DELETE /api/rules/:id
 * Delete an auto-reply rule
 */
async function deleteRule(req, res) {
  try {
    const { id } = req.params;

    const rule = await AutoReplyRule.findByIdAndDelete(id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    console.log(`✅ Rule deleted: ${id}`);
    return res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return res.status(500).json({ error: 'Failed to delete rule' });
  }
}

/**
 * PATCH /api/rules/:id/toggle
 * Toggle rule active/inactive status
 */
async function toggleRule(req, res) {
  try {
    const { id } = req.params;

    const rule = await AutoReplyRule.findById(id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    rule.isActive = !rule.isActive;
    await rule.save();

    console.log(`✅ Rule ${rule.isActive ? 'activated' : 'deactivated'}: ${id}`);

    return res.json(rule);
  } catch (error) {
    console.error('Error toggling rule:', error);
    return res.status(500).json({ error: 'Failed to toggle rule' });
  }
}

module.exports = {
  getAllRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRule
};
