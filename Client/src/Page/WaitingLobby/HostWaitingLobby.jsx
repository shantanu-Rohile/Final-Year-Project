import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HostWaitingLobby = () => {
  const navigate=useNavigate()
  const [roomCode] = useState("2v46z");
  const [copied, setCopied] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [participants] = useState(["Sandesh (Host)", "Aryan", "Aniket", "Piyush", "Shantanu"]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "MCQ",
    difficulty: "Medium",
    time: 30,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddQuestion = () => {
    if (!form.title) return;
    setQuestions([...questions, { ...form }]);
    setForm({ title: "", description: "", type: "MCQ", difficulty: "Medium", time: 30 });
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 p-6">
      {/* Top Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button className="text-sm text-gray-600 hover:underline" onClick={() => navigate("/")}>← Leave Room</button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Room Code:</span>
            <div
              className="flex items-center gap-2 bg-white border rounded-md px-3 py-1 cursor-pointer hover:bg-gray-50"
              onClick={handleCopy}
            >
              <span className="font-mono text-gray-800">{roomCode}</span>
              📋
            </div>
            {copied && <span className="text-xs text-green-600">Copied!</span>}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800">Waiting Lobby</h1>
        <p className="text-sm text-gray-600">Host Perspective</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left - Question Creation */}
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="font-medium text-gray-800 text-lg mb-4">Question Settings</h2>

          {/* Form */}
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option>MCQ</option>
              <option>True/False</option>
              <option>Fill in the Blank</option>
            </select>

            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Time (sec):</label>
            <input
              type="number"
              min="10"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="border rounded-md px-3 py-1 w-20 text-sm"
            />
          </div>

          {/* Add Question Button */}
          <button
            onClick={handleAddQuestion}
            className="w-full bg-black text-white rounded-md py-2 text-sm hover:bg-gray-800"
          >
            ➕ Add Question
          </button>

          {/* Chart Placeholder */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Question Generation (AI vs Manual)
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full w-[60%]"></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">60% AI, 40% Manual</p>
          </div>
        </div>

        {/* Right - Queue & Lobby */}
        <div className="space-y-6">
          {/* Question Queue */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-medium text-gray-800 text-lg mb-4">Questions Queue</h2>
            {questions.length === 0 ? (
              <p className="text-sm text-gray-500">No questions added yet.</p>
            ) : (
              <ul className="space-y-3">
                {questions.map((q, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{q.title}</p>
                      <p className="text-xs text-gray-500">
                        {q.type} • {q.difficulty} • {q.time}s
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Waiting Lobby */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-medium text-gray-800 text-lg mb-4">Participants</h2>
            <ul className="space-y-2 text-sm">
              {participants.map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    {p.charAt(0)}
                  </span>
                  <p>{p}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Start Quiz */}
          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium">
            🚀 Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostWaitingLobby;
