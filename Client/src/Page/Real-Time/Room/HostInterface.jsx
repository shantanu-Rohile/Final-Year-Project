import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Sparkles,
  X,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Crown,
  Users,
  CheckCircle2,
  ListChecks,
  Clock,
  Award,
  Rocket,
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
    <div className="min-h-screen w-full bg-white relative overflow-hidden px-4 py-8">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-200/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-100 blur-3xl" />

      {/* Toggle AI Sidebar Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowAISidebar(!showAISidebar)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition active:scale-[0.98]"
        >
          <Sparkles size={18} />
          <span className="hidden sm:inline">AI Assistant</span>
          {showAISidebar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pt-16">
        {/* MAIN CONTENT */}
        <div
          className={`flex-1 transition-all duration-300 ${showAISidebar ? "lg:mr-96" : ""}`}
        >
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-[0_10px_40px_-15px_rgba(124,58,237,0.25)] sm:p-8">
            {/* HEADER */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-200">
                <Crown className="h-7 w-7 text-white" />
              </div>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Host Panel
              </span>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                Room ID: <span className="text-purple-600">{roomId}</span>
              </h1>
            </div>

            {/* ---------- ADD QUESTION FORM ---------- */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-purple-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Add a Question
                </h3>
              </div>

              <form onSubmit={handleOnSubmit} className="space-y-3">
                <input
                  placeholder="Enter question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  className="w-full rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />

                <div className="space-y-2">
                  {options.map((option, index) => {
                    const isCorrect = correctOptionIndex === index;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOption(index, e.target.value)}
                          required
                          className="flex-1 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        />
                        <button
                          type="button"
                          onClick={() => setCorrectOptionIndex(index)}
                          className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                            isCorrect
                              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                              : "border-purple-100 bg-white text-slate-400 hover:border-purple-200 hover:text-purple-500"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Correct</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <div className="flex-1 min-w-[120px]">
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Award className="h-3.5 w-3.5" />
                      Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={marks}
                      onChange={(e) => setMarks(Number(e.target.value))}
                      className="w-full rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 transition active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </form>
            </div>

            {/* ---------- DIVIDER ---------- */}
            <div className="my-6 h-px bg-purple-100" />

            {/* ---------- QUESTION LIST ---------- */}
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                <ListChecks className="h-4 w-4 text-purple-400" />
                Added Questions ({questions.length})
              </h4>
            </div>

            {questions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 px-4 py-6 text-center">
                <p className="text-sm text-slate-400">No questions added yet.</p>
              </div>
            )}

            <div className="space-y-3">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4"
                >
                  <h5 className="text-sm font-bold text-slate-800">
                    {index + 1}. {q.questionText}
                  </h5>

                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={`text-xs ${
                          q.correctOptionIndex === i
                            ? "font-semibold text-emerald-600"
                            : "text-slate-500"
                        }`}
                      >
                        {opt.text}
                        {q.correctOptionIndex === i && " ✅"}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 flex gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> {q.marks} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {q.timeLimit}s
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- SUBMIT ALL ---------- */}
            <button
              onClick={handleOnSubmitQuestion}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-100 transition active:scale-[0.98]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Submit All Questions
            </button>

            {/* ---------- PLAYERS & START ---------- */}
            <div className="my-6 h-px bg-purple-100" />

            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              <Users className="h-4 w-4 text-purple-400" />
              Participants ({participants.length})
            </h4>

            {participants.length === 0 && (
              <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 px-4 py-6 text-center">
                <p className="text-sm text-slate-400">Waiting for players to join…</p>
              </div>
            )}

            <div className="space-y-2">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-purple-50/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-400 text-xs font-bold text-white">
                      {(p.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {p.username || "Anonymous"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {String(p.userId).slice(-6)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartContest}
              disabled={questions.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-purple-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Rocket className="h-4 w-4" />
              Start Contest
            </button>
          </div>
        </div>

        {/* AI SIDEBAR */}
        {showAISidebar && (
          <div className="w-full lg:w-96 lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:overflow-y-auto lg:pt-20 lg:pb-8 lg:px-4">
            <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-[0_10px_40px_-15px_rgba(124,58,237,0.35)]">
              {/* AI Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-500" />
                  <h3 className="text-lg font-bold text-slate-900">
                    AI Question Generator
                  </h3>
                </div>
                <button
                  onClick={() => setShowAISidebar(false)}
                  className="rounded p-1 text-slate-400 hover:bg-purple-50 lg:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              {/* AI Form */}
              <form onSubmit={handleAIGenerate} className="space-y-4">
                {/* Topic */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-500">
                    Topic / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={aiFormData.title}
                    onChange={(e) =>
                      setAiFormData({ ...aiFormData, title: e.target.value })
                    }
                    placeholder="e.g. JavaScript Array Methods"
                    disabled={isGenerating}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/40 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-500">
                    Description{" "}
                    <span className="text-slate-300">(optional)</span>
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
                    className="w-full resize-none rounded-xl border border-purple-100 bg-purple-50/40 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Difficulty Level <span className="text-rose-500">*</span>
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
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                            active
                              ? "border-purple-500 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white"
                              : "border-purple-100 bg-purple-50/40 text-slate-500"
                          }`}
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 transition disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
                  <div className="my-6 h-px bg-purple-100" />

                  <h4 className="mb-3 text-sm font-bold text-slate-900">
                    Generated Questions ({generatedQuestions.length})
                  </h4>

                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {generatedQuestions.map((q, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-purple-100 bg-purple-50/30 p-4"
                      >
                        <p className="mb-2 text-sm font-medium text-slate-800">
                          {q.questionText}
                        </p>

                        <ul className="mb-2 space-y-0.5 text-xs text-slate-500">
                          {q.options.map((opt, i) => (
                            <li key={i}>
                              {opt.text} {q.correctOptionIndex === i && "✅"}
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Award className="h-3.5 w-3.5" /> {q.marks}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {q.timeLimit}s
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddAIQuestion(q)}
                              title="Add to questions"
                              className="rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-500 p-1.5 text-white transition active:scale-95"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveAIQuestion(q)}
                              title="Remove"
                              className="rounded-lg bg-rose-500 p-1.5 text-white transition active:scale-95"
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