import express from 'express';
import { signup, login, getMe,updateUser,removePicture } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Private routes
router.get('/me', protect, getMe);
router.put('/update', protect, upload.single("profilePicture"), updateUser);

// ✅ New route to remove profile picture
router.put('/remove-picture', protect, removePicture);


export default router;