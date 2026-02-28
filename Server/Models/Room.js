// server/models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    length: 5
  },
  roomName: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Tech',
      'Science',
      'Language-learning',
      'Professional',
      'Career-Development',
      'General',
      'Study-Room',
      'Hobbies'
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster search by roomId
roomSchema.index({ roomId: 1 });

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

export default Room;