import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Sparkles,
  X,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { API_URL, SOCKET_URL } from "../../../config/backend.js";
import { useAuth } from "../../../context/AuthContext.jsx";

function HostInterface() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);

  // ---------- FORM STATE ----------
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [marks, setMarks] = useState(1);
  const [timeLimit, setTimeLimit] = useState(30);

  // ---------- QUESTIONS ----------
  const [questions, setQuestions] = useState([]);

  // ---------- AI SIDEBAR STATE ----------
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    title: "",
    description: "",
    difficulty: [],
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const difficulties = ["Easy", "Medium", "Hard"];

  // ---------- LOAD FROM LOCAL STORAGE ----------
  useEffect(() => {
    const storedQuestions = localStorage.getItem(`questionSet_${roomId}`);
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }

    const storedAIQuestions = localStorage.getItem(`aiQuestions_${roomId}`);
    if (storedAIQuestions) {
      setGeneratedQuestions(JSON.parse(storedAIQuestions));
    }

    const storedAIForm = localStorage.getItem(`aiForm_${roomId}`);
    if (storedAIForm) {
      setAiFormData(JSON.parse(storedAIForm));
    }
  }, [roomId]);

  // Save AI form data to localStorage
  useEffect(() => {
    localStorage.setItem(`aiForm_${roomId}`, JSON.stringify(aiFormData));
  }, [aiFormData, roomId]);

  // Save generated questions to localStorage
  useEffect(() => {
    localStorage.setItem(
      `aiQuestions_${roomId}`,
      JSON.stringify(generatedQuestions),
    );
  }, [generatedQuestions, roomId]);

  // ---------- OPTION CHANGE ----------
  const handleOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // ---------- ADD SINGLE QUESTION ----------
  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (correctOptionIndex === null) {
      alert("Please select correct option");
      return;
    }

    if (options.some((opt) => opt.trim() === "")) {
      alert("All options are required");
      return;
    }

    if (timeLimit < 5) {
      alert("Time limit must be at least 5 seconds");
      return;
    }

    const questionPayload = {
      questionText: question,
      options: options.map((opt) => ({ text: opt })),
      correctOptionIndex,
      marks,
      timeLimit,
    };

    const updatedQuestions = [...questions, questionPayload];
    setQuestions(updatedQuestions);

    localStorage.setItem(
      `questionSet_${roomId}`,
      JSON.stringify(updatedQuestions),
    );

    // Reset form
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(null);
    setMarks(1);
    setTimeLimit(30);
  };

  // ---------- SUBMIT ALL QUESTIONS ----------
  const handleOnSubmitQuestion = async () => {
    try {
      if (questions.length === 0) {
        alert("Add questions before submitting");
        return;
      }

      await axios.post(
        `${API_URL}/api/real-rooms/${roomId}/questions`,
        { questions },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      localStorage.removeItem(`questionSet_${roomId}`);
      localStorage.removeItem(`aiQuestions_${roomId}`);
      localStorage.removeItem(`aiForm_${roomId}`);

      alert("Questions submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to submit questions");
    }
  };

  // ---------- AI DIFFICULTY TOGGLE ----------
  const handleDifficultyToggle = (level) => {
    setAiFormData((prev) => ({
      ...prev,
      difficulty: prev.difficulty.includes(level)
        ? prev.difficulty.filter((d) => d !== level)
        : [...prev.difficulty, level],
    }));
  };

  // ---------- AI GENERATE QUESTIONS ----------
  const handleAIGenerate = async (e) => {
    e.preventDefault();

    if (!aiFormData.title || aiFormData.difficulty.length === 0) {
      alert("Please enter a title and select at least one difficulty level");
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/questions/asyncgenerate`,
        aiFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        // Add default marks and timeLimit if not provided
        const questionsWithDefaults = response.data.questions.map((q) => ({
          ...q,
          marks: q.marks || 1,
          timeLimit: q.timeLimit || 30,
        }));

        setGeneratedQuestions(questionsWithDefaults);

        // Reset AI form
        setAiFormData({
          title: "",
          description: "",
          difficulty: [],
        });
      } else {
        alert(response.data.error || "Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert(error.response?.data?.error || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------- ADD AI QUESTION TO MAIN LIST ----------
  const handleAddAIQuestion = (aiQuestion) => {
    const updatedQuestions = [...questions, aiQuestion];
    setQuestions(updatedQuestions);
    localStorage.setItem(
      `questionSet_${roomId}`,
      JSON.stringify(updatedQuestions),
    );

    // Remove from generated questions
    const updatedGenerated = generatedQuestions.filter((q) => q !== aiQuestion);
    setGeneratedQuestions(updatedGenerated);
  };

  // ---------- REMOVE AI QUESTION ----------
  const handleRemoveAIQuestion = (aiQuestion) => {
    const updatedGenerated = generatedQuestions.filter((q) => q !== aiQuestion);
    setGeneratedQuestions(updatedGenerated);
  };

  // Socket: join room, keep participant list updated, and start contest
  useEffect(() => {
    if (!roomId || !user?.id) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("Join-Room", {
      roomId,
      username: user?.username || "Host",
    });

    socketRef.current.on("participants-updated", (list) => {
      setParticipants(list || []);
    });

    return () => socketRef.current?.disconnect();
  }, [roomId, user?.id, user?.username]);

  const handleStartContest = () => {
    socketRef.current?.emit("start-contest", { roomId });
  };

  // ---------- UI ----------
  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--txt)" }}
    >
      {/* Toggle AI Sidebar Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowAISidebar(!showAISidebar)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-lg"
          style={{
            backgroundColor: showAISidebar ? "var(--btn-hover)" : "var(--btn)",
            color: "white",
          }}
        >
          <Sparkles size={18} />
          <span className="hidden sm:inline">AI Assistant</span>
          {showAISidebar ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pt-16">
        {/* MAIN CONTENT */}
        <div
          className={`flex-1 transition-all duration-300 ${showAISidebar ? "lg:mr-96" : ""}`}
        >
          <div
            className="rounded-lg border p-6"
            style={{
              backgroundColor: "var(--bg-sec)",
              borderColor: "rgba(var(--shadow-rgb),0.2)",
            }}
          >
            <h1 className="text-center mb-3 text-2xl font-bold">
              Room ID: {roomId}
            </h1>
            <h2
              className="text-center mb-4 text-lg"
              style={{ color: "var(--txt-dim)" }}
            >
              Host Panel
            </h2>

            {/* ---------- ADD QUESTION FORM ---------- */}
            <Form onSubmit={handleOnSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  placeholder="Enter question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  style={{
                    backgroundColor: "var(--bg-ter)",
                    color: "var(--txt)",
                    borderColor: "rgba(var(--shadow-rgb),0.2)",
                  }}
                />
              </Form.Group>

              {options.map((option, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center gap-2 mb-2"
                >
                  <Form.Control
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOption(index, e.target.value)}
                    required
                    style={{
                      backgroundColor: "var(--bg-ter)",
                      color: "var(--txt)",
                      borderColor: "rgba(var(--shadow-rgb),0.2)",
                    }}
                  />
                  <Form.Check
                    type="radio"
                    name="correctOption"
                    checked={correctOptionIndex === index}
                    onChange={() => setCorrectOptionIndex(index)}
                    label="Correct"
                    style={{ color: "var(--txt)" }}
                  />
                </div>
              ))}

              <div className="d-flex gap-3 mb-3 mt-3">
                <Form.Group>
                  <Form.Label>Marks</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    style={{
                      width: "120px",
                      backgroundColor: "var(--bg-ter)",
                      color: "var(--txt)",
                      borderColor: "rgba(var(--shadow-rgb),0.2)",
                    }}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Time Limit (seconds)</Form.Label>
                  <Form.Control
                    type="number"
                    min={5}
                    max={300}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    style={{
                      width: "150px",
                      backgroundColor: "var(--bg-ter)",
                      color: "var(--txt)",
                      borderColor: "rgba(var(--shadow-rgb),0.2)",
                    }}
                  />
                </Form.Group>
              </div>

              <Button
                type="submit"
                style={{
                  width: "100%",
                  backgroundColor: "var(--btn)",
                  border: "none",
                  padding: "12px",
                  fontWeight: "600",
                }}
              >
                Add Question
              </Button>
            </Form>

            {/* ---------- DIVIDER ---------- */}
            <div
              style={{
                height: "1px",
                background: "rgba(var(--shadow-rgb),0.2)",
                margin: "2rem 0",
              }}
            />

            {/* ---------- QUESTION LIST ---------- */}
            <h4 className="mb-3">Added Questions ({questions.length})</h4>

            {questions.length === 0 && (
              <p style={{ opacity: 0.7 }}>No questions added yet.</p>
            )}

            <div className="space-y-3">
              {questions.map((q, index) => (
                <div
                  key={index}
                  style={{
                    background: "var(--bg-ter)",
                    padding: "1.2rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(var(--shadow-rgb),0.1)",
                  }}
                >
                  <h5 style={{ color: "var(--txt)" }}>
                    {index + 1}. {q.questionText}
                  </h5>

                  <ul className="mt-2">
                    {q.options.map((opt, i) => (
                      <li key={i} style={{ color: "var(--txt-dim)" }}>
                        {opt.text}
                        {q.correctOptionIndex === i && " ✅"}
                      </li>
                    ))}
                  </ul>

                  <div className="d-flex gap-3 mt-2">
                    <span
                      style={{ color: "var(--txt-dim)", fontSize: "0.9rem" }}
                    >
                      Marks: {q.marks}
                    </span>
                    <span
                      style={{ color: "var(--txt-dim)", fontSize: "0.9rem" }}
                    >
                      Time: ⏱ {q.timeLimit}s
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- SUBMIT ALL ---------- */}
            <Button
              onClick={handleOnSubmitQuestion}
              style={{
                width: "100%",
                marginTop: "1.5rem",
                backgroundColor: "#2ecc71",
                border: "none",
                padding: "12px",
                fontWeight: "600",
              }}
            >
              Submit All Questions
            </Button>

            {/* ---------- PLAYERS & START ---------- */}
            <div
              style={{
                height: "1px",
                background: "rgba(var(--shadow-rgb),0.2)",
                margin: "2rem 0",
              }}
            />

            <h4 className="mb-3">Participants ({participants.length})</h4>

            {participants.length === 0 && (
              <p style={{ opacity: 0.7 }}>Waiting for players to join...</p>
            )}

            {participants.map((p, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-ter)",
                  padding: "0.9rem 1.2rem",
                  borderRadius: "10px",
                  marginBottom: "0.6rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{p.username || "Anonymous"}</span>
                <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>
                  {String(p.userId).slice(-6)}
                </span>
              </div>
            ))}

            <Button
              onClick={handleStartContest}
              style={{
                width: "100%",
                marginTop: "1rem",
                backgroundColor: "#3498db",
                border: "none",
                padding: "12px",
                fontWeight: "600",
              }}
              disabled={questions.length === 0}
            >
              Start Contest
            </Button>
          </div>
        </div>

        {/* AI SIDEBAR */}
        {showAISidebar && (
          <div className="w-full lg:w-96 lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:overflow-y-auto lg:pt-20 lg:pb-8 lg:px-4">
            <div
              className="rounded-lg border p-5 shadow-2xl"
              style={{
                backgroundColor: "var(--bg-sec)",
                borderColor: "rgba(var(--shadow-rgb),0.3)",
              }}
            >
              {/* AI Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} style={{ color: "var(--btn)" }} />
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--txt)" }}
                  >
                    AI Question Generator
                  </h3>
                </div>
                <button
                  onClick={() => setShowAISidebar(false)}
                  className="lg:hidden p-1 rounded hover:bg-opacity-10"
                  style={{ color: "var(--txt-dim)" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* AI Form */}
              <form onSubmit={handleAIGenerate} className="space-y-4">
                {/* Topic */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--txt-dim)" }}
                  >
                    Topic / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={aiFormData.title}
                    onChange={(e) =>
                      setAiFormData({ ...aiFormData, title: e.target.value })
                    }
                    placeholder="e.g. JavaScript Array Methods"
                    disabled={isGenerating}
                    className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--bg-ter)",
                      color: "var(--txt)",
                      borderColor: "rgba(var(--shadow-rgb),0.2)",
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--txt-dim)" }}
                  >
                    Description{" "}
                    <span style={{ color: "var(--txt-disabled)" }}>
                      (optional)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={aiFormData.description}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Extra context, syllabus focus, etc."
                    disabled={isGenerating}
                    className="w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--bg-ter)",
                      color: "var(--txt)",
                      borderColor: "rgba(var(--shadow-rgb),0.2)",
                    }}
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--txt-dim)" }}
                  >
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulties.map((level) => {
                      const active = aiFormData.difficulty.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          disabled={isGenerating}
                          onClick={() => handleDifficultyToggle(level)}
                          className="px-3 py-2 rounded-md text-sm font-medium transition border"
                          style={{
                            backgroundColor: active
                              ? "var(--btn)"
                              : "var(--bg-ter)",
                            color: active ? "white" : "var(--txt-dim)",
                            borderColor: active
                              ? "var(--btn)"
                              : "rgba(var(--shadow-rgb),0.2)",
                          }}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full px-4 py-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "var(--btn)",
                    color: "white",
                    opacity: isGenerating ? 0.6 : 1,
                  }}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Questions
                    </>
                  )}
                </button>
              </form>

              {/* Generated Questions */}
              {generatedQuestions.length > 0 && (
                <>
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(var(--shadow-rgb),0.2)",
                      margin: "1.5rem 0",
                    }}
                  />

                  <h4
                    className="text-sm font-semibold mb-3"
                    style={{ color: "var(--txt)" }}
                  >
                    Generated Questions ({generatedQuestions.length})
                  </h4>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedQuestions.map((q, index) => (
                      <div
                        key={index}
                        style={{
                          background: "var(--bg-ter)",
                          padding: "1rem",
                          borderRadius: "10px",
                          border: "1px solid rgba(var(--shadow-rgb),0.1)",
                        }}
                      >
                        <p
                          className="text-sm font-medium mb-2"
                          style={{ color: "var(--txt)" }}
                        >
                          {q.questionText}
                        </p>

                        <ul
                          className="text-xs mb-2"
                          style={{ color: "var(--txt-dim)" }}
                        >
                          {q.options.map((opt, i) => (
                            <li key={i}>
                              {opt.text} {q.correctOptionIndex === i && "✅"}
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center justify-between gap-2">
                          <div
                            className="flex gap-2 text-xs"
                            style={{ color: "var(--txt-disabled)" }}
                          >
                            <span>Marks: {q.marks}</span>
                            <span>⏱ {q.timeLimit}s</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddAIQuestion(q)}
                              className="p-1.5 rounded transition"
                              style={{
                                backgroundColor: "var(--btn)",
                                color: "white",
                              }}
                              title="Add to questions"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveAIQuestion(q)}
                              className="p-1.5 rounded transition"
                              style={{
                                backgroundColor: "#ef4444",
                                color: "white",
                              }}
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HostInterface;
