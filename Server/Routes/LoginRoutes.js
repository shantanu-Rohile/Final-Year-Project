import express from "express";
import bcrypt from "bcrypt";
import SigninModel from "../Models/SigninModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const loginRoutes = express.Router();

loginRoutes.post("/", async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await SigninModel.findOne({ name });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken=jwt.sign( { id: user._id, name: user.name },process.env.ACCESS_TOKEN_SECRET);

    res.status(200).json({
      message: "✅ Login successful",
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default loginRoutes;
