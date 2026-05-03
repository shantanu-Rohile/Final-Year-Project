// server/controllers/savedRoomController.js
import SavedRoom from '../models/SavedRoom.js';
import Room from '../models/Room.js';

// Add room to explored/saved rooms
export const addSavedRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.user.id;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: 'Room ID is required'
      });
    }

    // Check if room exists
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Check if user is the creator (can't save own room)
    if (room.createdBy.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot save your own room'
      });
    }

    // Check if already saved
    const existingSave = await SavedRoom.findOne({ userId, roomId });
    if (existingSave) {
      return res.status(400).json({
        success: false,
        error: 'Room already saved'
      });
    }

    // Save room
    await SavedRoom.create({ userId, roomId });

    console.log(`✅ Room ${roomId} saved by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Room added to explored rooms'
    });

  } catch (error) {
    console.error('❌ Error saving room:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove room from saved rooms
export const removeSavedRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const result = await SavedRoom.findOneAndDelete({ userId, roomId });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Saved room not found'
      });
    }

    console.log(`✅ Room ${roomId} removed by user ${userId}`);

    res.json({
      success: true,
      message: 'Room removed from explored rooms'
    });

  } catch (error) {
    console.error('❌ Error removing saved room:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's saved/explored rooms
export const getSavedRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedRooms = await SavedRoom.find({ userId })
      .sort({ savedAt: -1 });

    // Get room details
    const roomIds = savedRooms.map(sr => sr.roomId);
    const rooms = await Room.find({ roomId: { $in: roomIds } })
      .populate('createdBy', 'username')
      .populate('questions');

    res.json({
      success: true,
      rooms: rooms.map(room => ({
        roomId: room.roomId,
        roomName: room.roomName,
        category: room.category,
        description: room.description,
        createdBy: room.createdBy.username,
        questionCount: room.questions.length,
        participantCount: room.participants.length,
        createdAt: room.createdAt,
        savedAt: savedRooms.find(sr => sr.roomId === room.roomId)?.savedAt
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching saved rooms:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Check if a room is saved by user
export const checkRoomSaved = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const saved = await SavedRoom.findOne({ userId, roomId });

    res.json({
      success: true,
      isSaved: !!saved
    });

  } catch (error) {
    console.error('❌ Error checking saved room:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};