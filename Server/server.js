import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/database.js";
// import { startCronJobs } from './utils/cronJobs.js';
// Import routes
import authRoutes from "./routes/authRoute.js";
import questionRoutes from "./routes/questionRoute.js";
import roomRoutes from "./routes/roomRoute.js";
import savedRoomRoutes from "./routes/savedRoom.js";
import quizRoutes from "./routes/quizRoute.js";
import realRoomRoutes from "./routes/realRoomRoute.js";

import { registerRealtimeRoomSockets } from "./utils/realtimeRoomSockets.js";

dotenv.config();

const app = express();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/saved-rooms", savedRoomRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/real-rooms", realRoomRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// --- HTTP server (required for Socket.IO) ---
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

registerRealtimeRoomSockets(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
