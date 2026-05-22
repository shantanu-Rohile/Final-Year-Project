import jwt from "jsonwebtoken";
import Rooms from "../models/roomModel.js";

function getTokenFromSocket(socket) {
  return socket?.handshake?.auth?.token || null;
}

async function getUserIdFromSocket(socket) {
  const token = getTokenFromSocket(socket);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id || null;
  } catch {
    return null;
  }
}

function leaderboardFromRoom(room) {
  return (room.participants || [])
    .map((p) => ({
      userId: p.userId,
      username: p.username || "Anonymous",
      score: p.score || 0,
      completed: !!p.completed,
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

export function registerRealtimeRoomSockets(io) {
  io.on("connection", async (socket) => {
    const userId = await getUserIdFromSocket(socket);

    if (!userId) {
      socket.emit("error", { message: "Unauthorized" });
      socket.disconnect(true);
      return;
    }

    // Join-Room
    socket.on("Join-Room", async ({ roomId, username }) => {
      try {
        if (!roomId) return;
        const room = await Rooms.findOne({ roomId });
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomId);

        // Upsert participant
        const idx = (room.participants || []).findIndex(
          (p) => String(p.userId) === String(userId)
        );

        if (idx >= 0) {
          room.participants[idx].socketId = socket.id;
          room.participants[idx].username = username || room.participants[idx].username;
        } else {
          room.participants.push({
            userId,
            username: username || "Anonymous",
            socketId: socket.id,
          });
        }

        await room.save();

        // Broadcast participant list
        io.to(roomId).emit(
          "participants-updated",
          (room.participants || []).map((p) => ({
            userId: p.userId,
            username: p.username || "Anonymous",
          }))
        );

        const participant = room.participants.find(
          (p) => String(p.userId) === String(userId)
        );

        // Send room + personal state
        socket.emit("sync-state", {
          status: room.status,
          hostId: room.host,
          participant,
        });

        socket.emit("leaderboard-data", leaderboardFromRoom(room));
      } catch (e) {
        console.error("Join-Room error", e);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Host starts contest
    socket.on("start-contest", async ({ roomId }) => {
      try {
        if (!roomId) return;
        const room = await Rooms.findOne({ roomId });
        if (!room) return;

        if (String(room.host) !== String(userId)) {
          socket.emit("error", { message: "Only host can start the contest" });
          return;
        }

        if (!room.questions || room.questions.length === 0) {
          socket.emit("error", { message: "Add questions before starting" });
          return;
        }

        if (room.status !== "waiting") return;

        room.status = "live";
        room.contestStartedAt = new Date();

        // Initialize each participant's progression
        const now = new Date();
        room.participants = (room.participants || []).map((p) => ({
          ...p.toObject?.() ?? p,
          completed: false,
          currentQuestionIndex: 0,
          currentQuestionStartedAt: now,
        }));

        await room.save();

        io.to(roomId).emit("contest-started");
        io.to(roomId).emit("leaderboard-data", leaderboardFromRoom(room));

        // Per participant state
        for (const p of room.participants) {
          if (p.socketId) {
            io.to(p.socketId).emit("your-state", p);
          }
        }

        io.to(roomId).emit("sync-state", {
          status: room.status,
          hostId: room.host,
        });
      } catch (e) {
        console.error("start-contest error", e);
        socket.emit("error", { message: "Failed to start contest" });
      }
    });

    socket.on("submit-answer", async ({ roomId, questionId, selectedOption }) => {
      try {
        if (!roomId || !questionId) return;

        const room = await Rooms.findOne({ roomId });
        if (!room) return;
        if (room.status !== "live") return;

        const participant = (room.participants || []).find(
          (p) => String(p.userId) === String(userId)
        );
        if (!participant || participant.completed) return;

        // Prevent double-answering the same question
        participant.answers = participant.answers || [];
        const alreadyAnswered = participant.answers.some(
          (a) => String(a.questionId) === String(questionId)
        );
        if (alreadyAnswered) return;

        const q = (room.questions || []).find((qq) => String(qq._id) === String(questionId));
        if (!q) return;

        const isCorrect = selectedOption !== null && selectedOption !== undefined
          ? Number(selectedOption) === Number(q.correctOptionIndex)
          : false;

        participant.answers.push({
          questionId: q._id,
          selectedOption: selectedOption === null ? null : Number(selectedOption),
          isCorrect,
        });

        if (isCorrect) {
          participant.score = (participant.score || 0) + (q.marks || 1);
        }

        // Advance this participant
        const nextIndex = (participant.currentQuestionIndex ?? -1) + 1;
        if (nextIndex >= (room.questions || []).length) {
          participant.completed = true;
          participant.currentQuestionIndex = nextIndex;
          participant.currentQuestionStartedAt = null;
        } else {
          participant.currentQuestionIndex = nextIndex;
          participant.currentQuestionStartedAt = new Date();
        }

        await room.save();

        // Send this participant their updated state
        io.to(socket.id).emit("your-state", participant);

        // Broadcast leaderboard updates
        io.to(roomId).emit("leaderboard-data", leaderboardFromRoom(room));

        // End contest if everyone is done
        const allDone = (room.participants || []).length > 0 && (room.participants || []).every((p) => p.completed);
        if (allDone) {
          room.status = "ended";
          await room.save();
          io.to(roomId).emit("contest-ended");
          io.to(roomId).emit("sync-state", { status: room.status, hostId: room.host });
          io.to(roomId).emit("leaderboard-data", leaderboardFromRoom(room));
        }
      } catch (e) {
        console.error("submit-answer error", e);
        socket.emit("error", { message: "Failed to submit answer" });
      }
    });

    socket.on("contest-completed", async ({ roomId }) => {
      // Optional client signal. Server already decides completion.
      if (!roomId) return;
      try {
        const room = await Rooms.findOne({ roomId });
        if (!room) return;
        io.to(roomId).emit("leaderboard-data", leaderboardFromRoom(room));
      } catch {}
    });

    socket.on("disconnect", async () => {
      // Keep participant in list (so leaderboard doesn't disappear), but clear socketId.
      // (Optional) you can implement cleanup if needed.
      try {
        const rooms = await Rooms.find({ "participants.socketId": socket.id }).limit(5);
        for (const room of rooms) {
          const p = room.participants.find((pp) => pp.socketId === socket.id);
          if (p) p.socketId = "";
          await room.save();
          io.to(room.roomId).emit(
            "participants-updated",
            (room.participants || []).map((pp) => ({
              userId: pp.userId,
              username: pp.username || "Anonymous",
            }))
          );
        }
      } catch {}
    });
  });
}
