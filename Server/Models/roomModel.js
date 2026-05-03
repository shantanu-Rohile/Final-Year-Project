import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },

  options: {
    type: [optionSchema],
    validate: v => v.length === 4
  },

  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },

  marks: {
    type: Number,
    default: 1
  },

  timeLimit: {
    type: Number,
    required: true,
    default: 30, // fallback safety
    min: 5,
    max: 300
  }
}, { _id: true });


const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  username: String,  
  socketId: String,
  score: {
    type: Number,
    default: 0
  },
 answers: [
  {
    questionId: mongoose.Schema.Types.ObjectId,
    selectedOption: Number,
    isCorrect: Boolean
  }
],

completed: {
  type: Boolean,
  default: false
},

// Individual progression (time-based scoring per participant)
currentQuestionIndex: {
  type: Number,
  default: -1
},

currentQuestionStartedAt: {
  type: Date,
  default: null
}

}, { _id: false });

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    unique: true
  },

  roomId: {
    type: String,
    required: true,
    unique: true
  },

  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["waiting", "live", "ended"],
    default: "waiting"
  },

  contestStartedAt: {
    type: Date,
    default: null
  },

  // Legacy fields (kept for backward compatibility; no longer used for participant progression)
  currentQuestionIndex: { type: Number, default: -1 },
  currentQuestionStartedAt: { type: Date, default: null },

  questions: {
    type: [questionSchema],
    default: []
  },

  participants: {
    type: [participantSchema],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("realRoom", roomSchema);
