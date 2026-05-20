import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Sparkles,
  Plus,
  Trash2,
  Trophy,
  Clock,
  Users,
  PlayCircle,
  CloudUpload,
  ListChecks,
  CirclePlus,
  Gamepad2,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  GripVertical,
  ChevronRight,
} from "lucide-react";
import { API_URL, SOCKET_URL } from "../../../config/backend.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ─────────────────────────────────────────────────────────────
   Tiny shared primitives — keeps JSX below clean
───────────────────────────────────────────────────────────── */

/** Styled text input */
const Input = ({ className = "", ...props }) => (
  <input
    className={`
      w-full bg-[var(--bg-ter)] text-[var(--txt)]
      border border-[rgba(var(--shadow-rgb),.2)] rounded-[var(--radius)]
      px-3 py-2 text-sm outline-none
      focus:border-[rgba(var(--shadow-rgb),.55)]
      focus:ring-2 focus:ring-[rgba(var(--shadow-rgb),.12)]
      placeholder:text-[var(--txt-disabled)]
      transition-all duration-150
      ${className}
    `}
    {...props}
  />
);

/** Styled textarea */
const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`
      w-full bg-[var(--bg-ter)] text-[var(--txt)]
      border border-[rgba(var(--shadow-rgb),.2)] rounded-[var(--radius)]
      px-3 py-2 text-sm outline-none resize-none
      focus:border-[rgba(var(--shadow-rgb),.55)]
      focus:ring-2 focus:ring-[rgba(var(--shadow-rgb),.12)]
      placeholder:text-[var(--txt-disabled)]
      transition-all duration-150
      ${className}
    `}
    {...props}
  />
);

/** Field label with optional required asterisk */
const FieldLabel = ({ children, required }) => (
  <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--txt-dim)] mb-1.5">
    {children}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

/** Pill badge for marks / time / tags */
const Badge = ({ children, className = "" }) => (
  <span
    className={`
      inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
      bg-[rgba(var(--shadow-rgb),.15)] border border-[rgba(var(--shadow-rgb),.2)] text-[var(--txt-dim)]
      ${className}
    `}
  >
    {children}
  </span>
);

/** Horizontal rule */
const Divider = ({ className = "" }) => (
  <div className={`h-px bg-[rgba(var(--shadow-rgb),.12)] ${className}`} />
);

/** Panel section heading row with icon and optional count */
const SectionTitle = ({ icon: Icon, children, count }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={15} className="text-[var(--btn)]" />
    <span className="text-[13px] font-semibold text-[var(--txt)] tracking-wide">
      {children}
    </span>
    {count !== undefined && (
      <span
        className="
          ml-auto text-[10px] text-[var(--btn)]
          bg-[rgba(var(--shadow-rgb),.18)] border border-[rgba(var(--shadow-rgb),.25)]
          rounded-full px-2 py-0.5"
      >
        {count}
      </span>
    )}
  </div>
);

function SortableQuestionCard({ q, idx, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        hi-fade bg-[var(--bg-sec)]
        border border-[rgba(var(--shadow-rgb),.1)] rounded-xl p-4
        hover:border-[rgba(var(--shadow-rgb),.25)] transition-colors duration-150
      "
    >
      {/* Card header: drag handle + question number + remove button */}
      <div className="flex items-center gap-2 mb-1.5">
        {/* Drag handle — only this area triggers drag, not the whole card */}
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="
            flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0
            text-[var(--txt-disabled)] hover:text-purple-400
            hover:bg-[rgba(var(--shadow-rgb),.15)]
            cursor-grab active:cursor-grabbing transition-colors
          "
        >
          <GripVertical size={14} />
        </button>

        <p className="text-[10px] font-bold tracking-widest uppercase text-purple-400 flex-1">
          Question {String(idx + 1).padStart(2, "0")}
        </p>

        {/* Remove button */}
        <button
          onClick={() => onRemove(q.id)}
          aria-label="Remove question"
          className="
            flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0
            bg-red-500/10 text-red-400 border border-red-500/15
            hover:bg-red-500/25 transition-colors
          "
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Question text */}
      <p className="text-sm font-semibold text-[var(--txt)] leading-snug mb-3 pl-8">
        {q.questionText}
      </p>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-3 pl-8">
        {q.options.map((opt, i) => (
          <div
            key={i}
            className={`
              text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5
              ${
                q.correctOptionIndex === i
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-[var(--bg-ter)] text-[var(--txt-dim)]"
              }
            `}
          >
            <span className="font-bold opacity-60">{OPTION_LETTERS[i]}.</span>
            <span className="truncate">{opt.text}</span>
            {q.correctOptionIndex === i && (
              <CheckCircle2 size={11} className="ml-auto flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="flex gap-2 pl-8">
        <Badge>
          <Trophy size={9} />
          {q.marks} pt
        </Badge>
        <Badge>
          <Clock size={9} />
          {q.timeLimit}s
        </Badge>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
const OPTION_LETTERS = ["A", "B", "C", "D"];

function HostInterface() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const socketRef = useRef(null);

  /* ── State ── */
  const [participants, setParticipants] = useState([]);

  // Question form
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [marks, setMarks] = useState(1);
  const [timeLimit, setTimeLimit] = useState(30);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }, // prevents accidental drags on click
    }),
  );

  // Question list
  const [questions, setQuestions] = useState([]);

  // AI sidebar
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    title: "",
    description: "",
    difficulty: [],
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const difficulties = ["Easy", "Medium", "Hard"];

  /* ── Persist to / restore from localStorage ── */
  useEffect(() => {
    const sq = localStorage.getItem(`questionSet_${roomId}`);
    if (sq) setQuestions(JSON.parse(sq));
    const aq = localStorage.getItem(`aiQuestions_${roomId}`);
    if (aq) setGeneratedQuestions(JSON.parse(aq));
    const af = localStorage.getItem(`aiForm_${roomId}`);
    if (af) setAiFormData(JSON.parse(af));
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(`aiForm_${roomId}`, JSON.stringify(aiFormData));
  }, [aiFormData, roomId]);

  useEffect(() => {
    localStorage.setItem(
      `aiQuestions_${roomId}`,
      JSON.stringify(generatedQuestions),
    );
  }, [generatedQuestions, roomId]);

  /* ── Socket ── */
  useEffect(() => {
    if (!roomId || !user?.id) return;
    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current.emit("Join-Room", {
      roomId,
      username: user?.username || "Host",
    });
    socketRef.current.on("participants-updated", (list) =>
      setParticipants(list || []),
    );
    return () => socketRef.current?.disconnect();
  }, [roomId, user?.id, user?.username]);

  /* ── Handlers ── */
  const handleOption = (index, value) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (correctOptionIndex === null)
      return alert("Please select the correct option");
    if (options.some((o) => o.trim() === ""))
      return alert("All options are required");
    if (timeLimit < 5) return alert("Time limit must be at least 5 seconds");

    const payload = {
      id: crypto.randomUUID(),
      questionText: question,
      options: options.map((text) => ({ text })),
      correctOptionIndex,
      marks,
      timeLimit,
    };
    const updated = [...questions, payload];
    setQuestions(updated);
    localStorage.setItem(`questionSet_${roomId}`, JSON.stringify(updated));

    // Reset form
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(null);
    setMarks(1);
    setTimeLimit(30);
  };

  const handleOnSubmitQuestion = async () => {
    if (questions.length === 0) return alert("Add questions before submitting");
    try {
      await axios.post(
        `${API_URL}/api/real-rooms/${roomId}/questions`,
        { questions },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  const handleDifficultyToggle = (level) =>
    setAiFormData((prev) => ({
      ...prev,
      difficulty: prev.difficulty.includes(level)
        ? prev.difficulty.filter((d) => d !== level)
        : [...prev.difficulty, level],
    }));

  const handleAIGenerate = async (e) => {
    e.preventDefault();
    if (!aiFormData.title || aiFormData.difficulty.length === 0)
      return alert(
        "Please enter a title and select at least one difficulty level",
      );
    setIsGenerating(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/questions/asyncgenerate`,
        aiFormData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success) {
        setGeneratedQuestions(
          res.data.questions.map((q) => ({
            ...q,
            marks: q.marks || 1,
            timeLimit: q.timeLimit || 30,
          })),
        );
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

  const handleAddAIQuestion = (q) => {
    const stamped = q.id ? q : { ...q, id: crypto.randomUUID() };
    const updated = [...questions, stamped];
    setQuestions(updated);
    localStorage.setItem(`questionSet_${roomId}`, JSON.stringify(updated));
    setGeneratedQuestions((prev) => prev.filter((x) => x !== q));
  };

  // Reorder on drag end
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(questions, oldIndex, newIndex);
    setQuestions(reordered);
    localStorage.setItem(`questionSet_${roomId}`, JSON.stringify(reordered));
  };

  // Remove a single question by id
  const handleRemoveQuestion = (id) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    localStorage.setItem(`questionSet_${roomId}`, JSON.stringify(updated));
  };

  const handleRemoveAIQuestion = (q) =>
    setGeneratedQuestions((prev) => prev.filter((x) => x !== q));

  const handleStartContest = () =>
    socketRef.current?.emit("start-contest", { roomId });

  return (
    <>
      <div
        className="flex min-h-screen"
        style={{ background: "var(--bg-primary)", color: "var(--txt)" }}
      >
        {/* Sidebar  */}
        <aside
          className={`
            hi-scroll flex flex-col flex-shrink-0 overflow-hidden
            border-r border-[rgba(var(--shadow-rgb),.15)]
            transition-all duration-300
            ${showAISidebar ? "w-80" : "w-0"}
          `}
          style={{ background: "var(--bg-sec)" }}
        >
          {/* Inner wrapper keeps content from reflowing during animation */}
          <div className="w-80 flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(var(--shadow-rgb),.15)]">
              <div
                className="
                  w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  bg-[rgba(var(--shadow-rgb),.2)] border border-[rgba(var(--shadow-rgb),.3)]"
              >
                <Sparkles size={16} className="text-[var(--btn)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--txt)]">
                  AI Generator
                </p>
                <p className="text-[10px] text-[var(--txt-dim)]">
                  Auto-create questions
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto hi-scroll px-4 py-5 flex flex-col gap-5">
              {/* ── AI Form ── */}
              <form onSubmit={handleAIGenerate} className="flex flex-col gap-4">
                {/* Topic */}
                <div>
                  <FieldLabel required>Topic / Title</FieldLabel>
                  <Input
                    type="text"
                    placeholder="e.g. JavaScript Array Methods"
                    value={aiFormData.title}
                    onChange={(e) =>
                      setAiFormData({ ...aiFormData, title: e.target.value })
                    }
                    disabled={isGenerating}
                  />
                </div>

                {/* Description */}
                <div>
                  <FieldLabel>
                    Description{" "}
                    <span className="text-[var(--txt-disabled)] text-[10px] normal-case tracking-normal font-normal">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Textarea
                    rows={3}
                    placeholder="Extra context, syllabus focus…"
                    value={aiFormData.description}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        description: e.target.value,
                      })
                    }
                    disabled={isGenerating}
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <FieldLabel required>Difficulty</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulties.map((level) => {
                      const active = aiFormData.difficulty.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          disabled={isGenerating}
                          onClick={() => handleDifficultyToggle(level)}
                          className={`
                            py-2 rounded-[var(--radius)] text-xs font-semibold
                            border transition-all duration-150
                            ${
                              active
                                ? "bg-[var(--btn)] text-white border-[var(--btn)]"
                                : `bg-[var(--bg-ter)] text-[var(--txt-dim)]
                                 border-[rgba(var(--shadow-rgb),.2)]
                                 hover:border-[rgba(var(--shadow-rgb),.4)]`
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generate */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="
                    w-full py-2.5 rounded-[var(--radius)] text-sm font-semibold
                    flex items-center justify-center gap-2
                    bg-[var(--btn)] text-white
                    hover:bg-[var(--btn-hover)] transition-colors duration-150
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={15} className="hi-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate Questions
                    </>
                  )}
                </button>
              </form>

              {/* ── Generated Questions ── */}
              {generatedQuestions.length > 0 && (
                <>
                  <Divider />
                  <SectionTitle
                    icon={ListChecks}
                    count={generatedQuestions.length}
                  >
                    Generated
                  </SectionTitle>

                  <div className="flex flex-col gap-3">
                    {generatedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="
                          hi-fade bg-[var(--bg-ter)]
                          border border-[rgba(var(--shadow-rgb),.12)]
                          rounded-[var(--radius)] p-3
                        "
                      >
                        <p className="text-xs font-semibold text-[var(--txt)] leading-snug mb-2">
                          {q.questionText}
                        </p>
                        <ul className="flex flex-col gap-0.5 mb-3">
                          {q.options.map((opt, i) => (
                            <li
                              key={i}
                              className={`
                                text-[11px] px-2 py-1 rounded-md
                                ${
                                  q.correctOptionIndex === i
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "text-[var(--txt-dim)]"
                                }
                              `}
                            >
                              <span className="font-semibold mr-1">
                                {OPTION_LETTERS[i]}.
                              </span>
                              {opt.text}
                              {q.correctOptionIndex === i && (
                                <CheckCircle2
                                  size={10}
                                  className="inline ml-1 mb-0.5"
                                />
                              )}
                            </li>
                          ))}
                        </ul>

                        {/* Card footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1.5">
                            <Badge>
                              <Trophy size={9} />
                              {q.marks} pt
                            </Badge>
                            <Badge>
                              <Clock size={9} />
                              {q.timeLimit}s
                            </Badge>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleAddAIQuestion(q)}
                              aria-label="Add to question list"
                              className="
                                w-7 h-7 rounded-md flex items-center justify-center
                                bg-[var(--btn)] text-white
                                hover:bg-[var(--btn-hover)] transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                            <button
                              onClick={() => handleRemoveAIQuestion(q)}
                              aria-label="Remove generated question"
                              className="
                                w-7 h-7 rounded-md flex items-center justify-center
                                bg-red-500/15 text-red-400 border border-red-500/20
                                hover:bg-red-500/25 transition-colors
                              "
                            >
                              <Trash2 size={13} />
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
        </aside>

        {/* ════════════════════════════════════════════════
            MAIN PANEL
        ════════════════════════════════════════════════ */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* ── Top Bar ── */}
          <header
            className="
              sticky top-0 z-20 flex items-center justify-between
              px-6 h-[60px] flex-shrink-0
              border-b border-[rgba(var(--shadow-rgb),.15)]
            "
            style={{ background: "var(--bg-sec)" }}
          >
            {/* Left: toggle + room info */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAISidebar((v) => !v)}
                aria-label="Toggle AI sidebar"
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  bg-[rgba(var(--shadow-rgb),.15)] border border-[rgba(var(--shadow-rgb),.2)]
                  text-[var(--btn)] hover:bg-[rgba(var(--shadow-rgb),.25)] transition-colors
                "
              >
                {showAISidebar ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              <Gamepad2 size={18} className="text-[var(--btn)]" />

              <span
                className="
                  text-xs font-bold tracking-widest uppercase text-[var(--btn)]
                  bg-[rgba(var(--shadow-rgb),.18)] border border-[rgba(var(--shadow-rgb),.3)]
                  rounded-md px-3 py-1.5"
              >
                Room · {roomId}
              </span>

              <span className="text-xs text-[var(--txt-dim)] hidden sm:block">
                Host Panel
              </span>
            </div>

            {/* Right: stats + start */}
            <div className="flex items-center gap-2">
              {/* Online participants */}
              <div
                className="
                  flex items-center gap-2 text-xs text-[var(--txt-dim)]
                  bg-[var(--bg-ter)] border border-[rgba(var(--shadow-rgb),.12)]
                  rounded-md px-3 py-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <Users size={12} />
                <span>{participants.length} online</span>
              </div>

              {/* Question count */}
              <div
                className="
                  flex items-center gap-2 text-xs text-[var(--txt-dim)]
                  bg-[var(--bg-ter)] border border-[rgba(var(--shadow-rgb),.12)]
                  rounded-md px-3 py-1.5"
              >
                <ListChecks size={12} className="text-[var(--btn)]" />
                <span>{questions.length} questions</span>
              </div>

              {/* Start contest */}
              <button
                onClick={handleStartContest}
                disabled={questions.length === 0}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-[var(--radius)]
                  text-xs font-semibold bg-[var(--btn)] text-white
                  hover:bg-[var(--btn-hover)] transition-colors duration-150
                  disabled:bg-[var(--bg-ter)] disabled:text-[var(--txt-disabled)]
                  disabled:cursor-not-allowed"
              >
                <PlayCircle size={14} />
                Start Contest
              </button>
            </div>
          </header>

          {/* ── Two-column body ── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* LEFT — Add Question + Participants */}
            <div
              className="
                flex flex-col w-[420px] flex-shrink-0
                border-r border-[rgba(var(--shadow-rgb),.1)]
                overflow-y-auto hi-scroll"
            >
              {/* Add Question Form */}
              <div className="p-6">
                <SectionTitle icon={CirclePlus}>Add Question</SectionTitle>

                <form onSubmit={handleOnSubmit} className="flex flex-col gap-4">
                  {/* Question text */}
                  <div>
                    <FieldLabel required>Question</FieldLabel>
                    <Textarea
                      rows={2}
                      placeholder="Type your question here…"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      required
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <FieldLabel required>
                      Options &amp; Correct Answer
                    </FieldLabel>
                    <div className="flex flex-col gap-2">
                      {options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {/* Letter */}
                          <span className="w-5 text-center text-[11px] font-bold text-[var(--txt-disabled)] flex-shrink-0">
                            {OPTION_LETTERS[i]}
                          </span>

                          <Input
                            placeholder={`Option ${OPTION_LETTERS[i]}`}
                            value={opt}
                            onChange={(e) => handleOption(i, e.target.value)}
                            required
                          />

                          {/* Correct radio */}
                          <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={correctOptionIndex === i}
                              onChange={() => setCorrectOptionIndex(i)}
                              className="accent-purple-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span
                              className={`
                                text-[10px] font-semibold whitespace-nowrap transition-colors
                                ${
                                  correctOptionIndex === i
                                    ? "text-[var(--btn)]"
                                    : "text-[var(--txt-disabled)]"
                                }
                              `}
                            >
                              Correct
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marks + Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>
                        <Trophy size={9} className="inline mr-1 mb-0.5" />
                        Marks
                      </FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        value={marks}
                        onChange={(e) => setMarks(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <FieldLabel>
                        <Clock size={9} className="inline mr-1 mb-0.5" />
                        Time (sec)
                      </FieldLabel>
                      <Input
                        type="number"
                        min={5}
                        max={300}
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Add Question button */}
                  <button
                    type="submit"
                    className="
                      w-full py-2.5 rounded-[var(--radius)] text-sm font-semibold
                      flex items-center justify-center gap-2
                      bg-[var(--btn)] text-white
                      hover:bg-[var(--btn-hover)] transition-colors duration-150"
                  >
                    <Plus size={15} />
                    Add Question
                  </button>
                </form>

                {/* Submit All */}
                <button
                  onClick={handleOnSubmitQuestion}
                  className="
                    mt-3 w-full py-2.5 rounded-[var(--radius)] text-sm font-semibold
                    flex items-center justify-center gap-2
                    bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                    hover:bg-emerald-500/20 transition-colors duration-150"
                >
                  <CloudUpload size={15} />
                  Submit All Questions
                </button>
              </div>

              <Divider className="mx-6" />

              {/* Participants */}
              <div className="p-6">
                <SectionTitle icon={Users} count={participants.length}>
                  Participants
                </SectionTitle>

                {participants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users
                      size={28}
                      className="mx-auto mb-2 opacity-20 text-[var(--btn)]"
                    />
                    <p className="text-xs text-[var(--txt-disabled)]">
                      Waiting for players to join…
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {participants.map((p, i) => {
                      const initials = (p.username || "??")
                        .split(/[_\s-]/)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                      return (
                        <div
                          key={i}
                          className="
                            hi-fade flex items-center gap-3
                            bg-[var(--bg-ter)] border border-[rgba(var(--shadow-rgb),.08)]
                            rounded-[var(--radius)] px-3 py-2.5"
                        >
                          <div
                            className="
                              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                              bg-[rgba(var(--shadow-rgb),.25)] text-[var(--btn)]/90 text-[11px] font-semibold"
                          >
                            {initials}
                          </div>
                          <span className="text-sm text-[var(--txt)] flex-1">
                            {p.username || "Anonymous"}
                          </span>
                          <span className="text-[10px] text-[var(--txt-disabled)] font-mono">
                            #{String(p.userId).slice(-6)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Question List */}
            <div className="flex-1 overflow-y-auto hi-scroll p-6 min-w-0">
              <SectionTitle icon={ListChecks} count={questions.length}>
                Question List
              </SectionTitle>

              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div
                    className="
          w-16 h-16 rounded-2xl flex items-center justify-center mb-4
          bg-[rgba(var(--shadow-rgb),.12)] border border-[rgba(var(--shadow-rgb),.15)]"
                  >
                    <ListChecks
                      size={28}
                      className="text-[var(--btn)] opacity-40"
                    />
                  </div>
                  <p className="text-sm text-[var(--txt-disabled)] mb-1">
                    No questions added yet
                  </p>
                  <p className="text-xs text-[var(--txt-disabled)] opacity-60">
                    Use the form on the left or generate with AI
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {questions.map((q, idx) => (
                        <SortableQuestionCard
                          key={q.id}
                          q={q}
                          idx={idx}
                          onRemove={handleRemoveQuestion}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
        {/* ── end main panel ── */}
      </div>
    </>
  );
}

export default HostInterface;
