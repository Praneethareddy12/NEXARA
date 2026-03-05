const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/auth'); // Ensure you have this middleware

// POST request to mark a challenge as complete and award XP
router.post('/complete', authMiddleware, progressController.completeChallenge);

module.exports = router;