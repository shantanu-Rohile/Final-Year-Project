import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Loader2, Trophy, Clock, Crown, Medal, CheckCircle2, PlayCircle,
} from "lucide-react";
import { API_URL, SOCKET_URL } from "../../../config/backend.js";
import { useAuth } from "../../../context/AuthContext.jsx";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const styles = `
  @keyframes questionSlideIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.93); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes rowSlideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes podiumGrow {
    from { height: 0; opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes podiumFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes answerPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.04); }
    70%  { transform: scale(0.98); }
    100% { transform: scale(1.01); }
  }
  @keyframes timerShake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-3px); }
    40%       { transform: translateX(3px); }
    60%       { transform: translateX(-2px); }
    80%       { transform: translateX(2px); }
  }
  @keyframes timerPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes crownGlow {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(251,191,36,0.5)); transform: scale(1); }
    50%       { filter: drop-shadow(0 0 10px rgba(251,191,36,0.9)); transform: scale(1.12); }
  }
  @keyframes scoreFlash {
    0%   { color: var(--accent); transform: scale(1); }
    30%  { color: #f59e0b; transform: scale(1.2); }
    100% { color: var(--accent); transform: scale(1); }
  }
  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50%       { transform: scale(1.35); opacity: 0.4; }
  }
  @keyframes trophyBounce {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25%       { transform: translateY(-5px) rotate(-8deg); }
    75%       { transform: translateY(-3px) rotate(6deg); }
  }

  .question-enter  { animation: questionSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .fade-in-up      { animation: fadeInUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .fade-in         { animation: fadeIn 0.35s ease forwards; }
  .scale-in        { animation: scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .row-slide-in    { animation: rowSlideIn 0.35s ease forwards; }
  .answer-pop      { animation: answerPop 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .crown-glow      { animation: crownGlow 2s ease-in-out infinite; }
  .trophy-bounce   { animation: trophyBounce 2.5s ease-in-out infinite; }
  .score-flash     { animation: scoreFlash 0.5s ease forwards; }
  .timer-urgent    { animation: timerShake 0.4s ease, timerPulse 0.8s ease infinite; }
  .breathing-dot   { animation: breathe 1.6s ease-in-out infinite; }

  .stagger > *:nth-child(1)    { animation-delay: 0.04s; opacity: 0; }
  .stagger > *:nth-child(2)    { animation-delay: 0.09s; opacity: 0; }
  .stagger > *:nth-child(3)    { animation-delay: 0.14s; opacity: 0; }
  .stagger > *:nth-child(4)    { animation-delay: 0.19s; opacity: 0; }
  .stagger > *:nth-child(5)    { animation-delay: 0.24s; opacity: 0; }
  .stagger > *:nth-child(6)    { animation-delay: 0.29s; opacity: 0; }
  .stagger > *:nth-child(n+7)  { animation-delay: 0.34s; opacity: 0; }

  .podium-bar {
    transition: height 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    animation: podiumFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .podium-meta {
    animation: podiumFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .bar-urgent {
    box-shadow: 0 0 8px 2px rgba(248, 113, 113, 0.6);
  }
`;

function AnimatedScore({ value, className }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash]     = useState(false);
  const prevRef               = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    const from = prevRef.current;
    const to   = value;
    prevRef.current = to;
    setFlash(true);
    const steps = 12;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setDisplay(Math.round(from + ((to - from) * step) / steps));
      if (step >= steps) { clearInterval(id); setFlash(false); }
    }, 30);
    return () => clearInterval(id);
  }, [value]);

  return (
    <span className={`${className} ${flash ? "score-flash" : ""}`}>
      {display} pts
    </span>
  );
}

function Participant() {
  const { userId, roomId } = useParams();
  const navigate           = useNavigate();
  const { user }           = useAuth();

  const [questions, setQuestions]                       = useState([]);
  const [username, setUsername]                         = useState("");
  const [hostId, setHostId]                             = useState(null);
  const [loading, setLoading]                           = useState(true);

  const [status, setStatus]                             = useState("waiting");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [questionStartedAt, setQuestionStartedAt]       = useState(null);

  const [answeredQuestions, setAnsweredQuestions]       = useState(new Set());
  const [selectedByQuestionId, setSelectedByQuestionId] = useState({});
  const [justAnsweredId, setJustAnsweredId]             = useState(null);

  const [timeLeft, setTimeLeft]                         = useState(0);
  const [contestCompleted, setContestCompleted]         = useState(false);
  const [leaderboard, setLeaderboard]                   = useState([]);
  const [podiumReady, setPodiumReady]                   = useState(false);

  const socketRef   = useRef(null);
  const timerRef    = useRef(null);
  const finishedRef = useRef(false);

  const effectiveUserId = user?.id || userId;

  // Derive isHost from fetched hostId — stable reference
  const isHost = hostId && String(hostId) === String(effectiveUserId);

  /* ── FETCH ── */
  useEffect(() => {
    async function fetchData() {
      try {
        setUsername(user?.username || "Player");
        const roomRes = await axios.get(`${API_URL}/api/real-rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setQuestions(roomRes.data.questions || []);
        setHostId(roomRes.data.host);
        setStatus(roomRes.data.status);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [roomId, user?.username]);

  /* ── SOCKET ── */
  useEffect(() => {
    if (!roomId || !effectiveUserId || !username) return;
    socketRef.current = io(SOCKET_URL, { auth: { token: localStorage.getItem("token") } });
    socketRef.current.emit("Join-Room", { roomId, username });

    socketRef.current.on("sync-state", (s) => {
      if (!s) return;
      if (s.status) setStatus(s.status);
      // sync-state carries participant data only on initial join, not after start-contest
      if (s.participant) {
        if (typeof s.participant.currentQuestionIndex === "number")
          setCurrentQuestionIndex(s.participant.currentQuestionIndex);
        if (s.participant.currentQuestionStartedAt)
          setQuestionStartedAt(new Date(s.participant.currentQuestionStartedAt));
        if (s.participant.completed) setContestCompleted(true);
      }
    });

    // FIX: contest-started just flips status to "live".
    // The actual question state arrives via "your-state" sent right after by the server.
    socketRef.current.on("contest-started", () => {
      setStatus("live");
    });

    // FIX: your-state now always carries currentQuestionIndex + currentQuestionStartedAt,
    // so the first question loads immediately without a refresh.
    socketRef.current.on("your-state", (p) => {
      if (!p) return;
      if (typeof p.currentQuestionIndex === "number")
        setCurrentQuestionIndex(p.currentQuestionIndex);
      if (p.currentQuestionStartedAt)
        setQuestionStartedAt(new Date(p.currentQuestionStartedAt));
      if (p.completed) setContestCompleted(true);
    });

    socketRef.current.on("contest-ended", () => {
      setStatus("ended");
      finishContest();
    });

    socketRef.current.on("leaderboard-data", (data) => setLeaderboard(data || []));

    return () => socketRef.current?.disconnect();
  }, [roomId, effectiveUserId, username]);

  /* ── BACK BUTTON ── */
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPop = () => navigate(`/realRoom/${effectiveUserId}`, { replace: true });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [navigate, effectiveUserId]);

  /* ── TIMER ── */
  useEffect(() => {
    if (!questions.length || status !== "live" || !questionStartedAt || contestCompleted || currentQuestionIndex < 0) return;
    const q     = questions[currentQuestionIndex];
    const limit = q?.timeLimit || 30;

    const tick = () => {
      const elapsed   = Math.floor((Date.now() - new Date(questionStartedAt).getTime()) / 1000);
      const remaining = Math.max(0, limit - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0 && q?._id && !answeredQuestions.has(q._id)) {
        socketRef.current?.emit("submit-answer", { roomId, questionId: q._id, selectedOption: null });
        setAnsweredQuestions((prev) => new Set([...prev, q._id]));
      }
    };

    tick();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [questions, currentQuestionIndex, questionStartedAt, status, contestCompleted, roomId, answeredQuestions]);

  /* ── Podium entrance delay ── */
  useEffect(() => {
    if (contestCompleted && leaderboard.length > 0) {
      setPodiumReady(false);
      const t = setTimeout(() => setPodiumReady(true), 100);
      return () => clearTimeout(t);
    }
  }, [contestCompleted, leaderboard.length]);

  /* ── LOGIC ── */
  const finishContest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setContestCompleted(true);
    socketRef.current?.emit("contest-completed", { roomId });
  }, [roomId]);

  const submitAnswer = (questionId, optionIndex) => {
    if (status !== "live" || timeLeft <= 0 || answeredQuestions.has(questionId)) return;
    socketRef.current?.emit("submit-answer", { roomId, questionId, selectedOption: optionIndex });
    setAnsweredQuestions((prev) => new Set([...prev, questionId]));
    setSelectedByQuestionId((prev) => ({ ...prev, [questionId]: optionIndex }));
    setJustAnsweredId(questionId);
    setTimeout(() => setJustAnsweredId(null), 400);
  };

  const startContestAsHost = () => {
    if (!isHost) return;
    socketRef.current?.emit("start-contest", { roomId });
  };

  /* ── LOADING ── */
  if (loading)
    return (
      <div className="min-h-screen w-full bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );

  const currentQuestion   = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;
  const currentQuestionId = currentQuestion?._id;
  const alreadyAnswered   = currentQuestionId ? answeredQuestions.has(currentQuestionId) : false;
  const progressPct       = currentQuestion?.timeLimit
    ? Math.max(0, Math.min(100, (timeLeft / currentQuestion.timeLimit) * 100))
    : 0;
  const isUrgent = timeLeft > 0 && timeLeft <= 5;

  const LeaderboardRow = ({ u, idx, delay = 0 }) => {
    const isMe  = u.username === username;
    const isTop = idx === 0;
    return (
      <div
        className={`row-slide-in flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${
          isTop ? "border-amber-400/50 bg-[var(--bg-ter)]"
          : isMe ? "border-[var(--accent)]/40 bg-[var(--bg-ter)]/70"
          : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)]"
        }`}
        style={{ animationDelay: `${delay}s` }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-ter)] text-xs font-bold text-[var(--accent)]">
            {idx === 0 ? <Crown className="h-3.5 w-3.5 text-amber-400" />
            : idx === 1 ? <Medal className="h-3.5 w-3.5 text-slate-400" />
            : idx === 2 ? <Medal className="h-3.5 w-3.5 text-amber-600" />
            : `#${idx + 1}`}
          </span>
          <span className="text-xs font-semibold text-[var(--txt)] truncate max-w-[100px]">
            {u.username}
            {isMe && (
              <span className="ml-1.5 rounded-full bg-[var(--btn)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                You
              </span>
            )}
          </span>
        </div>
        <AnimatedScore value={u.score} className="text-xs font-extrabold text-[var(--accent)] shrink-0" />
      </div>
    );
  };

  const podiumConfig = {
    0: { heightPx: 128, ring: "ring-amber-400/60", badge: "bg-gradient-to-br from-amber-400 to-amber-300", bar: "bg-[var(--btn)]",  delay: "0.05s" },
    1: { heightPx: 96,  ring: "ring-slate-400/50",  badge: "bg-gradient-to-br from-slate-400 to-slate-300",  bar: "bg-slate-500",    delay: "0.2s"  },
    2: { heightPx: 64,  ring: "ring-amber-700/50",  badge: "bg-gradient-to-br from-amber-700 to-amber-600",  bar: "bg-amber-700",    delay: "0.35s" },
  };

  /* ═══════════════════════════════ UI ═══════════════════════════════ */
  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] relative overflow-hidden transition-colors duration-300">
      <style>{styles}</style>

      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[var(--accent)]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 h-[28rem] w-[28rem] rounded-full bg-[var(--accent)]/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="scale-in w-full max-w-2xl rounded-3xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] p-6 shadow-[0_10px_40px_-15px_rgba(var(--shadow-rgb),0.25)] sm:p-8">

          {/* Header */}
          <div className="fade-in flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--btn)] text-sm font-bold text-white shadow-md">
                {(username || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--txt)]">Hi, {username}</p>
                {isHost && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--txt)]">
                    <Crown className="h-3 w-3" /> Host
                  </span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--txt)]">
              {status === "live" ? "Live" : status === "ended" ? "Ended" : "Waiting"}
            </span>
          </div>

          {/* WAITING — HOST */}
          {status === "waiting" && isHost && (
            <div className="fade-in-up mt-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--btn)] shadow-lg">
                <PlayCircle className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm text-[var(--txt-dim)]">
                Upload questions in the Host Panel, then start the contest when everyone's ready.
              </p>
              <button
                onClick={startContestAsHost}
                disabled={!questions.length}
                className="flex items-center gap-2 rounded-xl bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 active:scale-95 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trophy className="h-4 w-4" />
                Start Contest
              </button>
            </div>
          )}

          {/* WAITING — HOST (live — show a monitor view instead of questions) */}
          {status === "live" && isHost && (
            <div className="fade-in-up mt-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--btn)] shadow-lg">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm font-semibold text-[var(--txt-dim)]">
                Contest is live. Watching participants…
              </p>
              {leaderboard.length > 0 && (
                <div className="w-full mt-2 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-amber-400 trophy-bounce" />
                    <h2 className="text-sm font-extrabold text-[var(--txt)]">Live Leaderboard</h2>
                  </div>
                  <div className="stagger space-y-2">
                    {leaderboard.map((u, idx) => (
                      <LeaderboardRow key={u.username} u={u} idx={idx} delay={idx * 0.05} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WAITING — PLAYER */}
          {status === "waiting" && !isHost && (
            <div className="fade-in-up mt-8 flex flex-col items-center gap-3 text-center">
              <span className="relative flex h-4 w-4">
                <span className="breathing-dot absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-[var(--accent)]" />
              </span>
              <p className="text-sm font-semibold text-[var(--txt-dim)]">Waiting for the host to start…</p>
            </div>
          )}

          {/* LIVE — PLAYER ONLY */}
          {status === "live" && !isHost && !contestCompleted && (
            <div className="mt-6">
              {currentQuestion ? (
                <div key={currentQuestionIndex} className="question-enter">
                  {/* Timer row */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-ter)] transition-colors duration-300 ${isUrgent ? "bg-rose-100/60" : ""}`}>
                      <Clock className={`h-5 w-5 transition-colors duration-300 ${isUrgent ? "text-rose-500" : "text-[var(--accent)]"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[var(--txt-disabled)]">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span
                          key={timeLeft}
                          className={`tabular-nums font-extrabold transition-colors duration-300 ${
                            isUrgent ? "text-rose-500 timer-urgent" : "text-[var(--accent)]"
                          }`}
                        >
                          {timeLeft}s
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-ter)]">
                        <div
                          className={`h-full rounded-full transition-colors duration-300 ${
                            isUrgent ? "bg-rose-400 bar-urgent" : "bg-[var(--btn)]"
                          }`}
                          style={{ width: `${progressPct}%`, transition: "width 1s linear" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question card */}
                  <div className="mb-5 rounded-2xl bg-[var(--btn)] p-5 text-white shadow-md">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                      Question {currentQuestionIndex + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-bold leading-snug">{currentQuestion.questionText}</h3>
                  </div>

                  {/* Options */}
                  <div className="stagger space-y-2.5">
                    {currentQuestion.options.map((opt, i) => {
                      const selected    = selectedByQuestionId[currentQuestionId] === i;
                      const disabled    = alreadyAnswered || timeLeft <= 0;
                      const justThisOne = selected && justAnsweredId === currentQuestionId;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => submitAnswer(currentQuestionId, i)}
                          disabled={disabled}
                          className={`fade-in-up flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                            selected
                              ? `border-[var(--accent)] bg-[var(--bg-ter)] text-[var(--accent)] ring-2 ring-[var(--accent)]/30 ${justThisOne ? "answer-pop" : "scale-[1.01]"}`
                              : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] text-[var(--txt)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-ter)]/60 hover:scale-[1.01]"
                          } ${disabled && !selected ? "opacity-50" : ""} ${disabled ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.99]"}`}
                        >
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                            selected ? "bg-[var(--btn)] text-white" : "bg-[var(--bg-ter)] text-[var(--accent)]"
                          }`}>
                            {OPTION_LETTERS[i] || i + 1}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />}
                        </button>
                      );
                    })}
                  </div>

                  {alreadyAnswered && (
                    <p className="fade-in mt-4 text-center text-xs font-semibold text-[var(--txt-disabled)]">
                      ✓ Answer locked in — waiting for the next question…
                    </p>
                  )}
                </div>
              ) : (
                <div className="fade-in-up flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <span className="relative flex h-4 w-4">
                    <span className="breathing-dot absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-[var(--accent)]" />
                  </span>
                  <p className="text-sm font-semibold text-[var(--txt-dim)]">Loading your first question…</p>
                </div>
              )}
            </div>
          )}

          {/* COMPLETED: Final Leaderboard */}
          {contestCompleted && (
            <div className="mt-8 fade-in">
              <div className="mb-6 flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-amber-400 trophy-bounce" />
                <h2 className="text-lg font-extrabold text-[var(--txt)]">Final Leaderboard</h2>
              </div>

              {leaderboard.length === 0 && (
                <p className="text-center text-sm text-[var(--txt-disabled)]">Waiting for leaderboard…</p>
              )}

              {leaderboard.length > 0 && (
                <>
                  <div className="mb-8 flex items-end justify-center gap-4 sm:gap-6">
                    {[1, 0, 2].filter((i) => leaderboard[i]).map((i) => {
                      const u    = leaderboard[i];
                      const isMe = u.username === username;
                      const cfg  = podiumConfig[i];

                      return (
                        <div key={i} className="flex flex-col items-center w-24 sm:w-28">
                          <div
                            className={`podium-meta flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ring-4 ${cfg.ring} ${cfg.badge} ${i === 0 ? "crown-glow" : ""}`}
                            style={{ animationDelay: cfg.delay }}
                          >
                            {i === 0 ? <Crown className="h-6 w-6" /> : <Medal className="h-5 w-5" />}
                          </div>
                          <p className="podium-meta mt-2 w-full truncate text-center text-sm font-bold text-[var(--txt)]" style={{ animationDelay: cfg.delay }}>
                            {u.username}
                          </p>
                          {isMe && (
                            <span className="podium-meta mt-0.5 rounded-full bg-[var(--btn)] px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ animationDelay: cfg.delay }}>
                              You
                            </span>
                          )}
                          <p className="podium-meta mt-0.5 text-sm font-extrabold text-[var(--txt)]" style={{ animationDelay: cfg.delay }}>
                            {u.score} pts
                          </p>
                          <div
                            className={`podium-bar mt-2 w-full flex items-start justify-center rounded-t-2xl ${cfg.bar} pt-2 overflow-hidden`}
                            style={{ height: podiumReady ? `${cfg.heightPx}px` : "0px", animationDelay: cfg.delay, transitionDelay: cfg.delay }}
                          >
                            <span className="text-sm font-extrabold text-white">#{i + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="stagger space-y-2">
                    {leaderboard.slice(3).map((u, idx) => {
                      const i    = idx + 3;
                      const isMe = u.username === username;
                      return (
                        <div
                          key={i}
                          className={`row-slide-in flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 ${
                            isMe
                              ? "border-[var(--accent)]/30 bg-[var(--bg-ter)]/50"
                              : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)]"
                          }`}
                          style={{ animationDelay: `${idx * 0.06}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-ter)] text-sm font-bold text-[var(--accent)]">
                              #{i + 1}
                            </span>
                            <span className="text-sm font-semibold text-[var(--txt)]">
                              {u.username}
                              {isMe && (
                                <span className="ml-2 rounded-full bg-[var(--btn)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                          <AnimatedScore value={u.score} className="text-sm font-extrabold text-[var(--accent)]" />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => navigate("/Home")}
                    className="mt-6 mx-auto block rounded-xl bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 active:scale-95 hover:scale-[1.03]"
                  >
                    Back to Home
                  </button>
                </>
              )}
            </div>
          )}

          {/* ENDED (not yet completed by this client) */}
          {status === "ended" && !contestCompleted && (
            <div className="mt-8 fade-in">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400 trophy-bounce" />
                <h2 className="text-lg font-extrabold text-[var(--txt)]">Leaderboard</h2>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-center text-sm text-[var(--txt-disabled)]">Waiting for leaderboard…</p>
              ) : (
                <div className="stagger space-y-2">
                  {leaderboard.map((u, idx) => (
                    <LeaderboardRow key={u.username} u={u} idx={idx} delay={idx * 0.05} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Participant;
