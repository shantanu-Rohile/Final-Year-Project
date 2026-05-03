import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Target, Plus, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roomCode, setRoomCode] = useState("");

  // ✅ Fetch todos from backend
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await axios.get("http://localhost:3000/landing/todo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGoals(
          res.data.map((t) => ({
            id: t._id,
            text: t.task,
            completed: t.completed,
          }))
        );
      } catch (err) {
        console.error("Error fetching todos:", err.response?.data || err.message);
      }
    };
    fetchTodos();
  }, []);

  // ✅ Add new goal
  const addGoal = async () => {
    if (newGoal.trim() === "") return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        "http://localhost:3000/landing/todo",
        { task: newGoal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals([
        ...goals,
        { id: res.data.todo._id, text: res.data.todo.task, completed: false },
      ]);
      setNewGoal("");
    } catch (err) {
      console.error("Error adding goal:", err.response?.data || err.message);
    }
  };

  // ✅ Toggle goal completion
  const toggleGoal = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.put(
        `http://localhost:3000/landing/todo/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals(
        goals.map((goal) =>
          goal.id === id ? { ...goal, completed: res.data.todo.completed } : goal
        )
      );
    } catch (err) {
      console.error("Error toggling goal:", err.response?.data || err.message);
    }
  };

  // ✅ Delete goal
  const deleteGoal = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:3000/landing/todo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(goals.filter((goal) => goal.id !== id));
    } catch (err) {
      console.error("Error deleting goal:", err.response?.data || err.message);
    }
  };

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await axios.post(
          "http://localhost:3000/login/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  // ✅ Handle join room
  const handleJoinRoom = () => {
    if (roomCode.trim() === "123") {
      navigate("/studwait");
    } else {
      alert("Please enter a valid room code");
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--txt)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto ml-[70px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, Student 👋</h1>
            <p className="text-[var(--txt-dim)] mt-1">
              Ready to learn something new today?
            </p>
          </div>

          {/* Search & Join/Create/Logout Section */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="flex items-center bg-[var(--bg-sec)] border border-[var(--bg-ter)] rounded-[var(--radius)] px-3 py-2 w-full sm:w-72 shadow-sm">
              <Search className="w-4 h-4 text-[var(--txt-dim)] mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for rooms, topics, or teachers..."
                className="flex-1 text-sm bg-[var(--bg-sec)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:outline-none"
              />
            </div>

            {/* Room Code Input */}
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              className="border border-[var(--bg-ter)] rounded-[var(--radius)] px-3 py-2 text-sm bg-[var(--bg-sec)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:ring-2 focus:ring-[var(--btn)] focus:outline-none w-full sm:w-40"
            />

            {/* Join Room */}
            <button
              onClick={handleJoinRoom}
              className="bg-[var(--btn)] text-white px-4 py-2 rounded-[var(--radius)] hover:bg-[var(--btn-hover)] transition"
            >
              Join Room
            </button>

            {/* Create Room */}
            <button
              onClick={() => navigate("/HostWait")}
              className="bg-[var(--btn)] text-white px-4 py-2 rounded-[var(--radius)] hover:bg-[var(--btn-hover)] transition flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> Create Room
            </button>

            {/* ✅ Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-[var(--radius)] hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Current Streak", value: "7 days" },
            { label: "Total Wins", value: "24" },
            { label: "Study Groups", value: "12" },
            { label: "Study Time", value: "42h" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-sm p-4 hover:shadow-md transition"
            >
              <p className="text-sm text-[var(--txt-dim)]">{stat.label}</p>
              <p className="text-xl font-semibold mt-1 text-[var(--txt)]">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Goals & Events */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* ✅ Goals Section */}
          <div className="lg:col-span-2 bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-sm p-5 hover:shadow-md transition">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-[var(--txt)]">
              <Target className="w-5 h-5 text-[var(--btn)]" /> Set Goals
            </h2>

            <div className="flex mb-4 gap-2">
              <input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="border border-[var(--bg-ter)] w-full p-2 rounded-[var(--radius)] text-sm bg-[var(--bg-primary)] text-[var(--txt)] focus:ring-2 focus:ring-[var(--btn)] focus:outline-none"
                placeholder="Add a new goal..."
              />
              <button
                onClick={addGoal}
                className="bg-[var(--btn)] text-white px-3 rounded-[var(--radius)] hover:bg-[var(--btn-hover)] transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <ul className="space-y-2">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className="flex items-center justify-between bg-[var(--bg-ter)] border border-[var(--bg-sec)] rounded-[var(--radius)] p-2 hover:bg-[var(--bg-sec)] transition"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal.id)}
                      className="w-4 h-4 accent-[var(--btn)]"
                    />
                    <span
                      className={
                        goal.completed
                          ? "line-through text-[var(--txt-dim)]"
                          : "text-[var(--txt)]"
                      }
                    >
                      {goal.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Events Section */}
          <div className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-sm p-5 hover:shadow-md transition">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-[var(--txt)]">
              <Calendar className="w-5 h-5 text-[var(--btn)]" /> Recent Events
            </h2>
            <div className="space-y-3">
              {[
                { title: "Math Quiz Championship", time: "Yesterday 2:00 PM · 45 joined" },
                { title: "Science Review Session", time: "Oct 1, 10:00 AM · 32 joined" },
                { title: "History Trivia Night", time: "Sep 30, 7:00 PM · 28 joined" },
              ].map((event, idx) => (
                <div
                  key={idx}
                  className="border border-[var(--bg-ter)] rounded-[var(--radius)] p-3 hover:bg-[var(--bg-primary)] transition"
                >
                  <p className="font-medium text-[var(--txt)]">{event.title}</p>
                  <p className="text-xs text-[var(--txt-dim)]">{event.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Rooms */}
        <section className="bg-[var(--bg-sec)] shadow-sm rounded-[var(--radius)] p-5 hover:shadow-md transition">
          <h2 className="font-semibold mb-4 text-[var(--txt)] flex items-center gap-2">
            <i className="fas fa-door-open text-[var(--btn)] w-5 h-5 mb-2"></i> Recent Rooms
          </h2>
          <div className="space-y-3">
            {[
              { title: "Algebra Basics", host: "Ms. Johnson", participants: 24, status: "active" },
              { title: "World War 2", host: "Mr. Smith", participants: 18, status: "completed" },
            ].map((room, idx) => (
              <div
                key={idx}
                className="border border-[var(--bg-ter)] rounded-[var(--radius)] p-3 flex justify-between hover:bg-[var(--bg-primary)] transition"
              >
                <div>
                  <p className="font-medium text-[var(--txt)]">{room.title}</p>
                  <p className="text-xs text-[var(--txt-dim)]">
                    Hosted by {room.host} · {room.participants} participants
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    room.status === "active" ? "text-green-500" : "text-blue-500"
                  }`}
                >
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
