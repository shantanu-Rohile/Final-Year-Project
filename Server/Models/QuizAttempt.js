// server/models/QuizAttempt.js
import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
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
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeSpent: {
      type: Number, // Float with 2 decimals (e.g., 12.45 seconds)
      required: true,
      min: 0,
      max: 30
    },
    pointsEarned: {
      type: Number,
      required: true,
      min: 0
    },
    answeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTime: {
    type: Number, // Total time in seconds
    default: 0
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now
  }
});

// Ensure one attempt per user per room
quizAttemptSchema.index({ userId: 1, roomId: 1 }, { unique: true });

// Index for leaderboard queries
quizAttemptSchema.index({ roomId: 1, totalScore: -1, totalTime: 1 });

const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;