import express from "express";
import TodoModel from "../Models/todoModel.js";
import { authenticationToken } from "../Middleware/jwtMiddleware.js";

const todoRoutes = express.Router();

// ✅ Get all todos for logged-in user
todoRoutes.get("/", authenticationToken, async (req, res) => {
  try {
    const tasks = await TodoModel.find({ userId: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Create new todo
todoRoutes.post("/", authenticationToken, async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ message: "Task is required" });

    const newTask = await TodoModel.create({
      task,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "✅ Task created successfully",
      todo: newTask,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Update (toggle) todo completion
todoRoutes.put("/:id", authenticationToken, async (req, res) => {
  try {
    const todo = await TodoModel.findOne({ _id: req.params.id, userId: req.user.id });
    if (!todo) return res.status(404).json({ message: "Task not found" });

    todo.completed = !todo.completed;
    await todo.save();

    res.status(200).json({ message: "Task updated", todo });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Delete todo
todoRoutes.delete("/:id", authenticationToken, async (req, res) => {
  try {
    const result = await TodoModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!result) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default todoRoutes;
