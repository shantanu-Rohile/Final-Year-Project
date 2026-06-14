import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import dns from "dns";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/database.js";

import authRoutes from "./routes/authRoute.js";
import questionRoutes from "./routes/questionRoute.js";
import roomRoutes from "./routes/roomRoute.js";
import savedRoomRoutes from "./routes/savedRoom.js";
import quizRoutes from "./routes/quizRoute.js";
import realRoomRoutes from "./routes/realRoomRoute.js";

import { registerRealtimeRoomSockets } from "./utils/realtimeRoomSockets.js";

dotenv.config();

const app = express();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 5000;

// ✅ Explicit CORS config — put this BEFORE all routes and other middleware
const allowedOrigins = [
  "https://final-year-project-peach-chi.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  // Add any other local dev origins you use
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Explicitly handle OPTIONS preflight for ALL routes
// app.options("*", cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
  res.status(404).json({ success: false, error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// HTTP server + Socket.IO
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

registerRealtimeRoomSockets(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});