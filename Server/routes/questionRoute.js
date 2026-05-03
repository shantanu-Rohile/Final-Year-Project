import express from 'express';
import { generateQuestions, asyncgenerateQuestions } from '../controllers/questionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/questions/generate
// router.post('/generate', generateQuestions);
router.post('/generate', protect, generateQuestions);
router.post('/asyncgenerate', protect, asyncgenerateQuestions);

export default router;