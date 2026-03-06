import express from 'express';
const router = express.Router();

// Import the controller and middleware using named imports
import * as progressController from '../controllers/progressController.js';
import { protect } from '../middlewares/auth.middleware.js'; 

// POST request to mark a challenge as complete and award XP
// We use 'protect' here to match the named export from your middleware
router.post('/complete', protect, progressController.completeChallenge);

export default router;