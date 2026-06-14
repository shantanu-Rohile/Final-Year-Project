import jwt from "jsonwebtoken";
import Rooms from "../Models/roomModel.js";
import calculatePoints from "../utils/scoring.js";

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

        const now = new Date();
        room.participants = (room.participants || []).map((p) => ({
          ...p.toObject?.() ?? p,
          completed: false,
          currentQuestionIndex: 0,
          currentQuestionStartedAt: now, // ✅ server stamps the start time
        }));

        await room.save();

        io.to(roomId).emit("contest-started");
        io.to(roomId).emit("leaderboard-data", leaderboardFromRoom(room));

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

    // Submit answer
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

        participant.answers = participant.answers || [];
        const alreadyAnswered = participant.answers.some(
          (a) => String(a.questionId) === String(questionId)
        );
        if (alreadyAnswered) return;

        const q = (room.questions || []).find(
          (qq) => String(qq._id) === String(questionId)
        );
        if (!q) return;

        // ✅ STEP 1: Calculate timeSpent using server timestamps BEFORE anything else
        // currentQuestionStartedAt was set by the server when the question began
        // So timeSpent = now - that timestamp = exact seconds the user took
        const now = Date.now();
        const timeSpent = participant.currentQuestionStartedAt
          ? Math.min(                                                    // cap at timeLimit so no negative bonus
              (now - new Date(participant.currentQuestionStartedAt).getTime()) / 1000,
              q.timeLimit || 30
            )
          : (q.timeLimit || 30);  // if somehow null, assume they used full time (0 bonus)

        // ✅ STEP 2: Check correctness
        const isCorrect =
          selectedOption !== null && selectedOption !== undefined
            ? Number(selectedOption) === Number(q.correctOptionIndex)
            : false;

        // ✅ STEP 3: Calculate points using the shared formula
        // Same formula as static contest: base(difficulty) + timeBonus
        const pointsEarned = calculatePoints(q.difficulty, timeSpent, isCorrect);

        // ✅ STEP 4: Push answer WITH timeSpent and pointsEarned stored
        participant.answers.push({
          questionId: q._id,
          selectedOption: selectedOption === null ? null : Number(selectedOption),
          isCorrect,
          timeSpent: Math.round(timeSpent),  // stored for analytics/review
          pointsEarned,                       // stored for per-question breakdown
        });

        // ✅ STEP 5: Add points to total score
        if (isCorrect) {
          participant.score = (participant.score || 0) + pointsEarned;
        }

        // ✅ STEP 6: Advance to next question — update startedAt for the NEXT question
        const nextIndex = (participant.currentQuestionIndex ?? 0) + 1;

        if (nextIndex >= (room.questions || []).length) {
          participant.completed = true;
          participant.currentQuestionIndex = nextIndex;
          participant.currentQuestionStartedAt = null; // no next question
        } else {
          participant.currentQuestionIndex = nextIndex;
          participant.currentQuestionStartedAt = new Date(); // ✅ fresh timestamp for next question
        }

        await room.save();

        // Send updated personal state back to this participant
        io.to(socket.id).emit("your-state", participant);

        // Broadcast updated leaderboard to everyone in the room
        io.to(roomId).emit("leaderboard-data", leaderboardFromRoom(room));

        // Check if all participants are done
        const allDone =
          (room.participants || []).length > 0 &&
          (room.participants || []).every((p) => p.completed);

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
      if (!roomId) return;
      try {
        const room = await Rooms.findOne({ roomId });
        if (!room) return;
        io.to(roomId).emit("leaderboard-data", leaderboardFromRoom(room));
      } catch {}
    });

    socket.on("disconnect", async () => {
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