// server/routes/savedRoom.js
import express from 'express';
import {
  addSavedRoom,
  removeSavedRoom,
  getSavedRooms,
  checkRoomSaved
} from '../controllers/savedRoomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.post('/add', protect, addSavedRoom);
router.delete('/remove/:roomId', protect, removeSavedRoom);
router.get('/', protect, getSavedRooms);
router.get('/check/:roomId', protect, checkRoomSaved);

export default router;