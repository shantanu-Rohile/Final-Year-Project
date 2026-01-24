// server/models/SavedRoom.js
import mongoose from 'mongoose';

const savedRoomSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    ref: 'Room'
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can't save the same room twice
savedRoomSchema.index({ userId: 1, roomId: 1 }, { unique: true });

const SavedRoom = mongoose.models.SavedRoom || mongoose.model('SavedRoom', savedRoomSchema);

export default SavedRoom;