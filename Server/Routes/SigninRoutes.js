import express from "express";
import bcrypt from "bcrypt";
import SigninModel from "../Models/SigninModel.js";

const signinRoute = express.Router();

// Get all users (optional for admin/testing)
signinRoute.get("/", async (req, res) => {
  try {
    const users = await SigninModel.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// Signup / Create new user
signinRoute.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await SigninModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await SigninModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "✅ User Created Successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default signinRoute;
