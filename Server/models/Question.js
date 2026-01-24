// server/models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    ref: 'Room'
  },
  type: {
    type: String,
    required: true,
    enum: ['MCQ', 'TRUE/FALSE']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    trim: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation: MCQ must have exactly 4 options
questionSchema.pre('save', function(next) {
  if (this.type === 'MCQ' && (!this.options || this.options.length !== 4)) {
    return next(new Error('MCQ questions must have exactly 4 options'));
  }
  if (this.type === 'TRUE/FALSE' && this.options && this.options.length > 0) {
    this.options = [];
  }
  next();
});

// Index for faster queries
questionSchema.index({ roomId: 1, order: 1 });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

export default Question;