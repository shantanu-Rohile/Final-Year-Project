import Rooms from "../Models/roomModel.js";
import express from "express";
import { protect } from "../middleware/auth.js";
import crypto from "crypto";

const roomRouter = express.Router();

/* CREATE ROOM */
roomRouter.post("/create", protect, async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const room = await Rooms.create({
      roomName,
      host: req.user.id,
      roomId: crypto.randomBytes(5).toString("hex").toUpperCase(),
      participants: []
    });

    res.status(201).json({ roomId: room.roomId });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Room already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

/* ADD QUESTIONS (HOST ONLY) */
roomRouter.post("/:roomId/questions", protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { questions } = req.body;

    const room = await Rooms.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Convert both to strings for comparison to handle ObjectId vs string mismatch
    if (String(room.host) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only host can add questions" });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({ message: "Contest already started" });
    }

    // Host can only upload questions while the contest is still in "waiting".
    // Do NOT start the contest here; the host starts it via socket event.
    room.questions = questions;
    room.currentQuestionIndex = -1;
    room.currentQuestionStartedAt = null;
    await room.save();

    res.json({ message: "Questions added successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


roomRouter.get("/:roomId", protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Rooms.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const roomData = room.toObject();
    if (roomData.questions) {
      roomData.questions.forEach(q => delete q.correctOptionIndex);
    }

    res.json(roomData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default roomRouter;
