// server/routes/quiz.js
import express from 'express';
import {
  checkAttempt,
  startQuiz,
  submitAnswer,
  getCurrentLeaderboard,
  completeQuiz,
  getFinalLeaderboard,
  heartbeat
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.get('/check-attempt/:roomId', protect, checkAttempt);
router.post('/start/:roomId', protect, startQuiz);
router.post('/submit-answer', protect, submitAnswer);
router.get('/current-leaderboard/:roomId/:questionIndex', protect, getCurrentLeaderboard);
router.post('/complete', protect, completeQuiz);
router.get('/final-leaderboard/:roomId', protect, getFinalLeaderboard);
router.post('/heartbeat', protect, heartbeat);

export default router;