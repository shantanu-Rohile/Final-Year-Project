// server/routes/room.js
import express from 'express';
import {
  createRoom,
  getMyRooms,
  searchRoom,
  getRoomDetails
} from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js'; // Your existing auth middleware

const router = express.Router();

// Protected routes (require authentication)
router.post('/create', protect, createRoom);
router.get('/my-rooms', protect, getMyRooms);
router.get('/search/:roomId', protect, searchRoom);
router.get('/details/:roomId', protect, getRoomDetails);

export default router;