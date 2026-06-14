import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Sparkles, Plus, Trash2, Trophy, Crown, Users, CheckCircle2,
  ListChecks, Clock, Award, Rocket, Layers, ChevronDown, ChevronUp,
} from "lucide-react";
import { API_URL, SOCKET_URL } from "../../../config/backend.js";
import { useAuth } from "../../../context/AuthContext.jsx";

const DIFFICULTY_COLORS = {
  Easy:   { pill: "bg-emerald-50 text-emerald-600 border-emerald-200", active: "bg-emerald-500 text-white border-emerald-500" },
  Medium: { pill: "bg-amber-50 text-amber-600 border-amber-200",       active: "bg-amber-500 text-white border-amber-500"     },
  Hard:   { pill: "bg-rose-50 text-rose-600 border-rose-200",          active: "bg-rose-500 text-white border-rose-500"       },
};

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function DifficultyPill({ level, small = false }) {
  const c = DIFFICULTY_COLORS[level]?.pill || "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold ${small ? "text-[10px]" : "text-xs"} ${c}`}>
      {level}
    </span>
  );
}

function HostInterface() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);

  // ---------- FORM STATE ----------
  const [question, setQuestion]                     = useState("");
  const [options, setOptions]                       = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [difficulty, setDifficulty]                 = useState("Medium");
  const [marks, setMarks]                           = useState(1);
  const [timeLimit, setTimeLimit]                   = useState(30);
  const [formOpen, setFormOpen]                     = useState(true);

  // ---------- AI GENERATED POOL (middle column) ----------
  const [aiPool, setAiPool] = useState([]);

  // ---------- QUIZ QUEUE (right column) ----------
  const [queue, setQueue] = useState([]);

  // ---------- AI STATE ----------
  const [aiFormData, setAiFormData]           = useState({ title: "", description: "", difficulty: [] });
  const [isGenerating, setIsGenerating]       = useState(false);

  // ---------- LOAD FROM LOCAL STORAGE ----------
  useEffect(() => {
    const storedQueue   = localStorage.getItem(`questionQueue_${roomId}`);
    if (storedQueue)   setQueue(JSON.parse(storedQueue));

    const storedAIPool  = localStorage.getItem(`aiPool_${roomId}`);
    if (storedAIPool)  setAiPool(JSON.parse(storedAIPool));

    const storedAIForm  = localStorage.getItem(`aiForm_${roomId}`);
    if (storedAIForm)  setAiFormData(JSON.parse(storedAIForm));
  }, [roomId]);

  useEffect(() => { localStorage.setItem(`questionQueue_${roomId}`, JSON.stringify(queue)); },   [queue,   roomId]);
  useEffect(() => { localStorage.setItem(`aiPool_${roomId}`,        JSON.stringify(aiPool)); },  [aiPool,  roomId]);
  useEffect(() => { localStorage.setItem(`aiForm_${roomId}`,        JSON.stringify(aiFormData)); }, [aiFormData, roomId]);

  // ---------- OPTION CHANGE ----------
  const handleOption = (index, value) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  // ---------- ADD MANUAL QUESTION → DIRECTLY TO QUEUE ----------
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (correctOptionIndex === null)          { alert("Please select the correct option"); return; }
    if (options.some((o) => o.trim() === "")) { alert("All options are required"); return; }
    if (timeLimit < 5)                        { alert("Time limit must be at least 5 seconds"); return; }

    const payload = {
      questionText: question,
      options: options.map((o) => ({ text: o })),
      correctOptionIndex,
      difficulty,
      marks,
      timeLimit,
    };

    // ✅ Goes straight into the queue
    setQueue((prev) => [...prev, payload]);

    // Reset form
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(null);
    setDifficulty("Medium");
    setMarks(1);
    setTimeLimit(30);
  };

  // ---------- AI POOL → QUEUE ----------
  const addAIToQueue = (q) => {
    if (queue.find((item) => item === q)) return;
    setQueue((prev) => [...prev, q]);
    setAiPool((prev) => prev.filter((item) => item !== q));
  };

  // ---------- QUEUE → AI POOL (send back) ----------
  const removeFromQueue = (q) => {
    setQueue((prev) => prev.filter((item) => item !== q));
    // Manually added questions are just dropped; AI questions could go back but we'll just drop for simplicity
  };

  // ---------- DELETE FROM AI POOL ----------
  const deleteFromAIPool = (q) => {
    setAiPool((prev) => prev.filter((item) => item !== q));
  };

  // ---------- DELETE FROM QUEUE ----------
  const deleteFromQueue = (q) => {
    setQueue((prev) => prev.filter((item) => item !== q));
  };

  // ---------- SUBMIT QUEUE ----------
 // ---------- SUBMIT QUEUE ----------
const handleSubmitQueue = async () => {
  if (queue.length === 0) { alert("Add at least one question to the queue"); return; }
  try {
    await axios.post(
      `${API_URL}/api/real-rooms/${roomId}/questions`,
      { questions: queue },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
    );

    // ✅ Only clear localStorage, NOT the queue state
    // Queue must stay visible so the host can still start the contest
    localStorage.removeItem(`questionQueue_${roomId}`);
    localStorage.removeItem(`aiPool_${roomId}`);
    localStorage.removeItem(`aiForm_${roomId}`);

    alert("Questions submitted successfully! You can now start the contest.");
  } catch (err) {
    console.error(err);
    alert("Failed to submit questions");
  }
};

  // ---------- AI DIFFICULTY TOGGLE ----------
  const handleAIDiffToggle = (level) => {
    setAiFormData((prev) => ({
      ...prev,
      difficulty: prev.difficulty.includes(level)
        ? prev.difficulty.filter((d) => d !== level)
        : [...prev.difficulty, level],
    }));
  };

  // ---------- AI GENERATE → SENDS TO MIDDLE COLUMN ----------
  const handleAIGenerate = async (e) => {
    e.preventDefault();
    if (!aiFormData.title || aiFormData.difficulty.length === 0) {
      alert("Please enter a title and select at least one difficulty level");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/api/questions/asyncgenerate`, aiFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        const withDefaults = res.data.questions.map((q) => ({
          ...q,
          marks:      q.marks      || 1,
          timeLimit:  q.timeLimit  || 30,
          difficulty: q.difficulty || "Medium",
        }));
        // ✅ AI questions go to the MIDDLE column (aiPool)
        setAiPool((prev) => [...prev, ...withDefaults]);
        setAiFormData({ title: "", description: "", difficulty: [] });
      } else {
        alert(res.data.error || "Failed to generate questions");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------- SOCKET ----------
  useEffect(() => {
    if (!roomId || !user?.id) return;
    socketRef.current = io(SOCKET_URL, { auth: { token: localStorage.getItem("token") } });
    socketRef.current.emit("Join-Room", { roomId, username: user?.username || "Host" });
    socketRef.current.on("participants-updated", (list) => setParticipants(list || []));
    return () => socketRef.current?.disconnect();
  }, [roomId, user?.id, user?.username]);

  const handleStartContest = () => socketRef.current?.emit("start-contest", { roomId });

  // ---------- UI ----------
  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[var(--accent)]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 h-[28rem] w-[28rem] rounded-full bg-[var(--accent)]/10 blur-3xl" />

      {/* ── Top Bar ── */}
      <div className="relative z-10 border-b border-[color:rgba(var(--shadow-rgb),0.12)] bg-[var(--bg-sec)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--btn)]">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--txt-disabled)]">Host Panel</p>
            <p className="text-sm font-extrabold text-[var(--txt)]">
              Room <span className="text-[var(--accent)]">{roomId}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-ter)]/40 px-3 py-1.5">
            <Users className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--txt)]">{participants.length}</span>
            <span className="text-xs text-[var(--txt-disabled)]">joined</span>
          </div>
          <button
            onClick={handleStartContest}
            disabled={queue.length === 0}
            className="flex items-center gap-2 rounded-xl bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-4 py-2 text-sm font-bold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Rocket className="h-4 w-4" />
            Start Contest
          </button>
        </div>
      </div>

      {/* ── 3-Column Layout ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[500px_minmax(0,1fr)_450px] gap-0 h-[calc(100vh-65px)]">

        {/* ══════════ LEFT: Generate Questions ══════════ */}
        <div className="border-r border-[color:rgba(var(--shadow-rgb),0.12)] bg-[var(--bg-sec)] flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-[color:rgba(var(--shadow-rgb),0.1)]">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--txt)]">
                Generate Questions
              </h2>
            </div>
          </div>

          <div className="p-5 space-y-8 flex-1">

            {/* ── Manual Add Form ── */}
            <div className="rounded-2xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-ter)]/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setFormOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-sm font-bold text-[var(--txt)]">Add Manually</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Badge hinting where it goes */}
                  <span className="rounded-full bg-[var(--btn)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                    → Queue
                  </span>
                  {formOpen
                    ? <ChevronUp className="h-4 w-4 text-[var(--txt-disabled)]" />
                    : <ChevronDown className="h-4 w-4 text-[var(--txt-disabled)]" />}
                </div>
              </button>

              {formOpen && (
                <form onSubmit={handleAddQuestion} className="px-4 pb-4 space-y-3 border-t border-[color:rgba(var(--shadow-rgb),0.1)]">
                  <div className="pt-3">
                    <input
                      placeholder="Enter question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] px-3 py-2.5 text-sm text-[var(--txt)] placeholder:text-[var(--txt-disabled)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-ter)] text-xs font-bold text-[var(--accent)]">
                          {["A","B","C","D"][i]}
                        </span>
                        <input
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => handleOption(i, e.target.value)}
                          required
                          className="flex-1 rounded-xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] px-3 py-2 text-sm text-[var(--txt)] placeholder:text-[var(--txt-disabled)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setCorrectOptionIndex(i)}
                          className={`shrink-0 rounded-lg border p-2 transition ${
                            correctOptionIndex === i
                              ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                              : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] text-[var(--txt-disabled)] hover:text-emerald-500"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-[var(--txt-disabled)]">Difficulty</label>
                    <div className="flex gap-2">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d} type="button" onClick={() => setDifficulty(d)}
                          className={`flex-1 rounded-xl border px-2 py-1.5 text-xs font-semibold transition ${
                            difficulty === d
                              ? DIFFICULTY_COLORS[d].active
                              : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] text-[var(--txt-dim)]"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marks + Time */}
                  <div className="flex gap-3">
                  
                    <div className="flex-1">
                      <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-[var(--txt-disabled)]">
                        <Clock className="h-3 w-3" /> Seconds
                      </label>
                      <input type="number" min={5} max={300} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full rounded-xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] px-3 py-2 text-sm text-[var(--txt)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                  </div>

                  <button type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--btn)] hover:bg-[var(--btn-hover)] py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Directly to Queue
                  </button>
                </form>
              )}
            </div>

            {/* ── AI Generator ── */}
            <div className="rounded-2xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-ter)]/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                  <h3 className="text-sm font-bold text-[var(--txt)]">AI Question Generator</h3>
                </div>
                <span className="rounded-full bg-[var(--btn)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                  → AI Pool
                </span>
              </div>

              <form onSubmit={handleAIGenerate} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--txt-disabled)]">
                    Topic / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" value={aiFormData.title}
                    onChange={(e) => setAiFormData({ ...aiFormData, title: e.target.value })}
                    placeholder="e.g. JavaScript Array Methods" disabled={isGenerating}
                    className="w-full rounded-xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] px-3 py-2 text-sm text-[var(--txt)] placeholder:text-[var(--txt-disabled)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--txt-disabled)]">
                    Description <span className="text-[var(--txt-disabled)]">(optional)</span>
                  </label>
                  <textarea
                    rows={2} value={aiFormData.description}
                    onChange={(e) => setAiFormData({ ...aiFormData, description: e.target.value })}
                    placeholder="Extra context, syllabus focus, etc." disabled={isGenerating}
                    className="w-full resize-none rounded-xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] px-3 py-2 text-sm text-[var(--txt)] placeholder:text-[var(--txt-disabled)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--txt-disabled)]">
                    Difficulty <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map((level) => {
                      const active = aiFormData.difficulty.includes(level);
                      return (
                        <button key={level} type="button" disabled={isGenerating}
                          onClick={() => handleAIDiffToggle(level)}
                          className={`flex-1 rounded-xl border px-2 py-1.5 text-xs font-semibold transition ${
                            active
                              ? DIFFICULTY_COLORS[level].active
                              : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] text-[var(--txt-dim)]"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button type="submit" disabled={isGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--btn)] hover:bg-[var(--btn-hover)] py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                  {isGenerating ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Generating…</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Generate Questions</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ══════════ MIDDLE: AI Generated Pool ══════════ */}
        <div className="border-r border-[color:rgba(var(--shadow-rgb),0.12)] bg-[var(--bg-primary)] flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-[color:rgba(var(--shadow-rgb),0.1)] bg-[var(--bg-primary)] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--txt)]">AI Generated</h2>
            </div>
            <span className="rounded-full bg-[var(--bg-ter)] px-2.5 py-0.5 text-xs font-bold text-[var(--txt-dim)]">
              {aiPool.length} questions
            </span>
          </div>

          <div className="flex-1 p-5">
            {aiPool.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-ter)]">
                  <Sparkles className="h-7 w-7 text-[var(--txt-disabled)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--txt-dim)]">No AI questions yet</p>
                <p className="text-xs text-[var(--txt-disabled)]">Generate questions from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiPool.map((q, idx) => (
                  <div key={idx}
                    className="group rounded-2xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] p-4 transition hover:border-[var(--accent)]/30 hover:shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--txt)] leading-snug flex-1">
                        {idx + 1}. {q.questionText}
                      </p>
                      <DifficultyPill level={q.difficulty} />
                    </div>

                    <ul className="mb-3 space-y-1">
                      {q.options.map((opt, i) => (
                        <li key={i} className={`flex items-center gap-2 text-xs ${
                          q.correctOptionIndex === i ? "font-semibold text-emerald-600" : "text-[var(--txt-dim)]"
                        }`}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                            q.correctOptionIndex === i ? "bg-emerald-100 text-emerald-600" : "bg-[var(--bg-ter)] text-[var(--txt-disabled)]"
                          }`}>
                            {["A","B","C","D"][i]}
                          </span>
                          {opt.text}
                          {q.correctOptionIndex === i && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-[var(--txt-disabled)]">
                        <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{q.marks} pts</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{q.timeLimit}s</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => deleteFromAIPool(q)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => addAIToQueue(q)}
                          className="flex items-center gap-1.5 rounded-lg bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-3 py-1.5 text-xs font-semibold text-white transition"
                        >
                          Add to Queue <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══════════ RIGHT: Quiz Queue ══════════ */}
        <div className="bg-[var(--bg-sec)] flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-[color:rgba(var(--shadow-rgb),0.1)] bg-[var(--bg-sec)] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--txt)]">Quiz Queue</h2>
              <span className="rounded-full bg-[var(--btn)] px-2 py-0.5 text-xs font-bold text-white">
                {queue.length}
              </span>
            </div>
          </div>

          <div className="flex-1 p-5 flex flex-col">
            {queue.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-ter)]">
                  <Layers className="h-7 w-7 text-[var(--txt-disabled)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--txt-dim)]">Queue is empty</p>
                <p className="text-xs text-[var(--txt-disabled)]">
                  Manual questions go here automatically; add AI questions from the middle panel
                </p>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {queue.map((q, idx) => (
                  <div key={idx} className="rounded-xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-ter)]/40 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-[var(--txt)] leading-snug line-clamp-2 flex-1">
                        {idx + 1}. {q.questionText}
                      </p>
                      <button onClick={() => deleteFromQueue(q)}
                        className="shrink-0 rounded-lg p-1 text-[var(--txt-disabled)] hover:bg-rose-50 hover:text-rose-500 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <DifficultyPill level={q.difficulty} small />
                      <span className="text-[10px] text-[var(--txt-disabled)]">{q.marks} pts · {q.timeLimit}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Participants */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--accent)]/70" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--txt-dim)]">
                  Participants ({participants.length})
                </h4>
              </div>
              {participants.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[color:rgba(var(--shadow-rgb),0.2)] bg-[var(--bg-ter)]/40 px-4 py-4 text-center">
                  <p className="text-xs text-[var(--txt-disabled)]">Waiting for players to join…</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {participants.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-[color:rgba(var(--shadow-rgb),0.1)] bg-[var(--bg-ter)]/40 px-3 py-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--btn)] text-xs font-bold text-white shrink-0">
                        {(p.username || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-[var(--txt)] truncate flex-1">
                        {p.username || "Anonymous"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit + Start */}
            <div className="mt-6 space-y-2">
              <button onClick={handleSubmitQueue} disabled={queue.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-100 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit Questions ({queue.length})
              </button>
              <button onClick={handleStartContest} disabled={queue.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-4 py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Rocket className="h-4 w-4" />
                Start Contest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostInterface;