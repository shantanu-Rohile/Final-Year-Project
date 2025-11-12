import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import signinRoute from "./Routes/SigninRoutes.js";
import loginRoutes from "./Routes/LoginRoutes.js";
import todoRoutes from "./Routes/todoRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Environment vars
const PORT = process.env.PORT || 3000;

// Routes
app.use("/signin", signinRoute); // for user registration
app.use("/login", loginRoutes);  // for user login
app.use("/landing/todo", todoRoutes);  // for user login
// Database connection
mongoose
  .connect(process.env.mongoURL)
  .then(() => {
    console.log("✅ Database Connected");
    app.listen(PORT, () => console.log(`🚀 App listening on PORT : ${PORT}`));
  })
  .catch((err) => {
    console.log(`❌ Database Connection Error: ${err}`);
  });
