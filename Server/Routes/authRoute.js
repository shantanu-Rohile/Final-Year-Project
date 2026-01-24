import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Private routes
router.get('/me', protect, getMe);

export default router;