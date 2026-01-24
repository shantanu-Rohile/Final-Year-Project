// server/controllers/roomController.js
import Room from '../models/Room.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { nanoid } from 'nanoid';

// Create a new room with questions
export const createRoom = async (req, res) => {
  try {
    const { roomName, category, description, questions } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validation
    if (!roomName || !category) {
      return res.status(400).json({
        success: false,
        error: 'Room name and category are required'
      });
    }

    if (!questions || questions.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'At least 5 questions are required to create a room'
      });
    }

    // Generate unique 5-character room ID
    const roomId = nanoid(5).toUpperCase();

    // Create room
    const room = await Room.create({
      roomId,
      roomName,
      category,
      description,
      createdBy: userId,
      participants: []
    });

    // Create questions with order
    const questionDocs = await Question.insertMany(
      questions.map((q, index) => ({
        roomId: room.roomId,
        type: q.type,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        order: index + 1
      }))
    );

    // Update room with question IDs
    room.questions = questionDocs.map(q => q._id);
    await room.save();

    // Update user's createdRooms
    await User.findByIdAndUpdate(userId, {
      $push: { createdRooms: room._id }
    });

    console.log(`✅ Room created: ${roomId} by user ${userId}`);

    res.status(201).json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        category: room.category,
        description: room.description,
        questionCount: questionDocs.length
      }
    });

  } catch (error) {
    console.error('❌ Error creating room:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's created rooms
export const getMyRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const rooms = await Room.find({ createdBy: userId })
      .populate('questions')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      rooms: rooms.map(room => ({
        roomId: room.roomId,
        roomName: room.roomName,
        category: room.category,
        description: room.description,
        questionCount: room.questions.length,
        participantCount: room.participants.length,
        createdAt: room.createdAt
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching user rooms:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Search room by roomId
export const searchRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log('Searching for room ID:', roomId);

    if (!roomId || roomId.length !== 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID format (must be 5 characters)'
      });
    }

    const room = await Room.findOne({ roomId })
      .populate('createdBy', 'username')
      .populate('questions');

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        category: room.category,
        description: room.description,
        createdBy: room.createdBy.username,
        questionCount: room.questions.length,
        participantCount: room.participants.length,
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error searching room:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get room details with questions (for quiz)
export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId })
      .populate('createdBy', 'username')
      .populate({
        path: 'questions',
        options: { sort: { order: 1 } }
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      room
    });

  } catch (error) {
    console.error('❌ Error fetching room details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};