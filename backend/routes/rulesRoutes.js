const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/rulesController');

/**
 * Auto-Reply Rules Routes
 * CRUD for managing auto-reply rules
 */

// GET all rules
router.get('/', rulesController.getAllRules);

// POST create a new rule
router.post('/', rulesController.createRule);

// PUT update a rule
router.put('/:id', rulesController.updateRule);

// DELETE a rule
router.delete('/:id', rulesController.deleteRule);

// PATCH toggle rule active status
router.patch('/:id/toggle', rulesController.toggleRule);

module.exports = router;
