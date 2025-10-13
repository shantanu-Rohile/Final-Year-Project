import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HostWaitingLobby = () => {
  const navigate = useNavigate();
  const [roomCode] = useState("2v46z");
  const [copied, setCopied] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [participants] = useState([
    "Sandesh (Host)",
    "Aryan",
    "Aniket",
    "Piyush",
    "Shantanu",
  ]);

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
    setForm({
      title: "",
      description: "",
      type: "MCQ",
      difficulty: "Medium",
      time: 30,
    });
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      {/* Top Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-[var(--txt)] border border-[var(--bg-ter)] bg-[var(--bg-sec)] px-3 py-1.5 rounded-[var(--radius)] transition-all duration-300 hover:bg-[var(--btn)] hover:text-white hover:shadow-md"
          >
            ← Leave Room
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--txt-dim)]">Room Code:</span>
            <div
              className="flex items-center gap-2 bg-[var(--bg-sec)] border border-[var(--bg-ter)] rounded-md px-3 py-1 cursor-pointer hover:bg-[var(--bg-ter)]"
              onClick={handleCopy}
            >
              <span className="font-mono text-[var(--txt)]">{roomCode}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-[var(--txt-dim)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V6a2 2 0 00-2-2h-6l-2-2H6a2 2 0 00-2 2v2"
                />
              </svg>
            </div>
            {copied && <span className="text-xs text-green-500">Copied!</span>}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--txt)]">
          Waiting Lobby
        </h1>
        <p className="text-sm text-[var(--txt-dim)]">Host Perspective</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left - Question Creation */}
        <div className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-md p-6 space-y-6">
          <h2 className="font-medium text-[var(--txt)] text-lg mb-4">
            Question Settings
          </h2>

          {/* Form */}
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-[var(--bg-ter)] rounded-[var(--radius)] px-3 py-2 text-sm bg-[var(--bg-primary)] text-[var(--txt)] placeholder-[var(--txt-dim)]"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-[var(--bg-ter)] rounded-[var(--radius)] px-3 py-2 text-sm bg-[var(--bg-primary)] text-[var(--txt)] placeholder-[var(--txt-dim)]"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-[var(--bg-ter)] rounded-[var(--radius)] px-3 py-2 text-sm bg-[var(--bg-primary)] text-[var(--txt)]"
            >
              <option>MCQ</option>
              <option>True/False</option>
              <option>Fill in the Blank</option>
            </select>

            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="border border-[var(--bg-ter)] rounded-[var(--radius)] px-3 py-2 text-sm bg-[var(--bg-primary)] text-[var(--txt)]"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--txt-dim)]">Time (sec):</label>
            <input
              type="number"
              min="10"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="border border-[var(--bg-ter)] rounded-[var(--radius)] px-3 py-1 w-20 text-sm bg-[var(--bg-primary)] text-[var(--txt)]"
            />
          </div>

          {/* Add Question Button */}
          <button
            onClick={handleAddQuestion}
            className="w-full bg-[var(--btn)] text-white rounded-[var(--radius)] py-2 text-sm hover:bg-[var(--btn-hover)] flex items-center justify-center"
          >
            <span className="mr-2">➕</span> Add Question
          </button>

          {/* Chart Placeholder */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-[var(--txt-dim)] mb-2">
              Question Generation (AI vs Manual)
            </h3>
            <div className="w-full bg-[var(--bg-ter)] rounded-full h-2">
              <div className="bg-[var(--btn)] h-2 rounded-full w-[60%]"></div>
            </div>
            <p className="text-xs text-[var(--txt-dim)] mt-1">
              60% AI, 40% Manual
            </p>
          </div>
        </div>

        {/* Right - Queue & Lobby */}
        <div className="space-y-6">
          {/* Question Queue */}
          <div className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-md p-6">
            <h2 className="font-medium text-[var(--txt)] text-lg mb-4">
              Questions Queue
            </h2>
            {questions.length === 0 ? (
              <p className="text-sm text-[var(--txt-dim)]">
                No questions added yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {questions.map((q, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border border-[var(--bg-ter)] rounded-[var(--radius)] p-3"
                  >
                    <div>
                      <p className="font-medium text-sm text-[var(--txt)]">
                        {q.title}
                      </p>
                      <p className="text-xs text-[var(--txt-dim)]">
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
          <div className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-md p-6">
            <h2 className="font-medium text-[var(--txt)] text-lg mb-4">
              Participants
            </h2>
            <ul className="space-y-2 text-sm">
              {participants.map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--bg-ter)] flex items-center justify-center text-xs font-medium text-[var(--txt)]">
                    {p.charAt(0)}
                  </span>
                  <p className="text-[var(--txt)]">{p}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Start Quiz */}
          <button className="w-full bg-[var(--btn)] text-white py-3 rounded-[var(--radius)] hover:bg-[var(--btn-hover)] font-medium flex items-center justify-center">
            🚀 Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostWaitingLobby;
