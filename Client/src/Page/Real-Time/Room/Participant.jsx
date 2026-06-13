import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Loader2,
  Trophy,
  Clock,
  Crown,
  Medal,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { API_URL, SOCKET_URL } from "../../../config/backend.js";
import { useAuth } from "../../../context/AuthContext.jsx";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

/* ── Smooth slide-in animation for question transitions ── */
const questionTransitionStyle = `
  @keyframes questionSlideIn {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .question-enter {
    animation: questionSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
`;

function Participant() {
  const { userId, roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [username, setUsername] = useState("");
  const [hostId, setHostId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Contest state (server is source of truth)
  const [status, setStatus] = useState("waiting");
  // Individual progression state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [questionStartedAt, setQuestionStartedAt] = useState(null);

  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [selectedByQuestionId, setSelectedByQuestionId] = useState({});

  const [timeLeft, setTimeLeft] = useState(0);
  const [contestCompleted, setContestCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const finishedRef = useRef(false);

  const effectiveUserId = user?.id || userId;
  const isHost = hostId && String(hostId) === String(effectiveUserId);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    async function fetchData() {
      try {
        setUsername(user?.username || "Player");

        const roomRes = await axios.get(`${API_URL}/api/real-rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setQuestions(roomRes.data.questions || []);
        setHostId(roomRes.data.host);
        setStatus(roomRes.data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [roomId, user?.username]);

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!roomId || !effectiveUserId || !username) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("Join-Room", {
      roomId,
      username,
    });

    socketRef.current.on("sync-state", (s) => {
      if (!s) return;
      if (s.status) setStatus(s.status);
      if (s.participant) {
        if (typeof s.participant.currentQuestionIndex === "number") {
          setCurrentQuestionIndex(s.participant.currentQuestionIndex);
        }
        if (s.participant.currentQuestionStartedAt) {
          setQuestionStartedAt(new Date(s.participant.currentQuestionStartedAt));
        }
        if (s.participant.completed) {
          setContestCompleted(true);
        }
      }
    });

    socketRef.current.on("contest-started", () => {
      setStatus("live");
    });

    socketRef.current.on("your-state", (p) => {
      if (!p) return;
      if (typeof p.currentQuestionIndex === "number") setCurrentQuestionIndex(p.currentQuestionIndex);
      if (p.currentQuestionStartedAt) setQuestionStartedAt(new Date(p.currentQuestionStartedAt));
      if (p.completed) {
        setContestCompleted(true);
      }
    });

    socketRef.current.on("contest-ended", () => {
      setStatus("ended");
      finishContest();
    });

    socketRef.current.on("leaderboard-data", (data) => {
      setLeaderboard(data || []);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, effectiveUserId, username]);

  /* ================= BACK BUTTON BEHAVIOR ================= */

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      navigate(`/realRoom/${effectiveUserId}`, { replace: true });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigate, effectiveUserId]);

  /* ================= TIMER (SYNCED + SMOOTH) ================= */

  useEffect(() => {
    if (!questions.length) return;
    if (status !== "live") return;
    if (!questionStartedAt) return;
    if (contestCompleted) return;
    if (currentQuestionIndex < 0) return;

    const q = questions[currentQuestionIndex];
    const limit = q?.timeLimit || 30;

    // Tick every second for smooth 1s bar transition
    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(questionStartedAt).getTime()) / 1000);
      const remaining = Math.max(0, limit - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && q?._id && !answeredQuestions.has(q._id)) {
        socketRef.current?.emit("submit-answer", {
          roomId,
          questionId: q._id,
          selectedOption: null,
        });

        setAnsweredQuestions((prev) => {
          const updated = new Set(prev);
          updated.add(q._id);
          return updated;
        });
      }
    };

    tick();
    if (timerRef.current) clearInterval(timerRef.current);
    // Use 1000ms so the CSS transition: width 1s linear lines up perfectly
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions, currentQuestionIndex, questionStartedAt, status, contestCompleted, roomId, answeredQuestions]);

  /* ================= LOGIC ================= */

  const finishContest = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setContestCompleted(true);
    socketRef.current?.emit("contest-completed", { roomId });
  };

  const submitAnswer = (questionId, optionIndex) => {
    if (status !== "live") return;
    if (timeLeft <= 0) return;
    if (answeredQuestions.has(questionId)) return;

    socketRef.current?.emit("submit-answer", {
      roomId,
      questionId,
      selectedOption: optionIndex,
    });

    setAnsweredQuestions((prev) => {
      const updated = new Set(prev);
      updated.add(questionId);
      return updated;
    });

    setSelectedByQuestionId((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const startContestAsHost = () => {
    if (!isHost) return;
    socketRef.current?.emit("start-contest", { roomId });
  };

  if (loading)
    return (
      <div className="min-h-screen w-full bg-[var(--bg-primary)] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );

  const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;
  const currentQuestionId = currentQuestion?._id;
  const alreadyAnswered = currentQuestionId ? answeredQuestions.has(currentQuestionId) : false;

  const progressPct = currentQuestion?.timeLimit
    ? Math.max(0, Math.min(100, (timeLeft / currentQuestion.timeLimit) * 100))
    : 0;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] relative overflow-hidden transition-colors duration-300">
      {/* Inject keyframe animation */}
      <style>{questionTransitionStyle}</style>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[var(--accent)]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 h-[28rem] w-[28rem] rounded-full bg-[var(--accent)]/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {/*
          During live contest: max-w-5xl wide card to accommodate two-column layout.
          Otherwise: max-w-2xl narrow card for waiting/ended states.
        */}
        <div
          className={`w-full rounded-3xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] p-6 shadow-[0_10px_40px_-15px_rgba(var(--shadow-rgb),0.25)] sm:p-8 ${
            status === "live" && !contestCompleted ? "max-w-5xl" : "max-w-2xl"
          }`}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--btn)] text-sm font-bold text-white">
                {(username || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--txt)]">Hi, {username}</p>
                {isHost && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                    <Crown className="h-3 w-3" /> Host
                  </span>
                )}
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                status === "live"
                  ? "bg-emerald-50 text-emerald-600"
                  : status === "ended"
                  ? "bg-[var(--bg-ter)] text-[var(--accent)]"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {status === "live" ? "Live" : status === "ended" ? "Ended" : "Waiting"}
            </span>
          </div>

          {/* ── WAITING — HOST ── */}
          {status === "waiting" && isHost && (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--btn)] shadow-lg shadow-[color:rgba(var(--shadow-rgb),0.2)]">
                <PlayCircle className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm text-[var(--txt-dim)]">
                Upload questions in the Host Panel, then start the contest when everyone's ready.
              </p>
              <button
                onClick={startContestAsHost}
                disabled={!questions.length}
                className="flex items-center gap-2 rounded-xl bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[color:rgba(var(--shadow-rgb),0.2)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trophy className="h-4 w-4" />
                Start Contest
              </button>
            </div>
          )}

          {/* ── WAITING — PLAYER ── */}
          {status === "waiting" && !isHost && (
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--accent)]" />
              </span>
              <p className="text-sm font-semibold text-[var(--txt-dim)]">
                Waiting for the host to start…
              </p>
            </div>
          )}

          {/* ── LIVE: Two-column layout ── */}
          {status === "live" && !contestCompleted && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">

              {/* ── LEFT: Active Question ── */}
              {currentQuestion ? (
                <div
                  key={currentQuestionIndex}
                  className="question-enter"
                >
                  {/* Timer bar */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-ter)] text-[var(--accent)]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[var(--txt-disabled)]">
                        <span>
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span className={timeLeft <= 5 ? "text-rose-500" : "text-[var(--accent)]"}>
                          {timeLeft}s
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-ter)]">
                        <div
                          className={`h-full rounded-full ${
                            timeLeft <= 5
                              ? "bg-rose-400"
                              : "bg-[var(--btn)]"
                          }`}
                          style={{
                            width: `${progressPct}%`,
                            /* Matches the 1s tick interval for a perfectly smooth sweep */
                            transition: "width 1s linear",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question card */}
                  <div className="mb-5 rounded-2xl bg-[var(--btn)] p-5 text-white shadow-md shadow-[color:rgba(var(--shadow-rgb),0.2)]">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                      Question {currentQuestionIndex + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-bold leading-snug">
                      {currentQuestion.questionText}
                    </h3>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt, i) => {
                      const selected = selectedByQuestionId[currentQuestionId] === i;
                      const disabled = alreadyAnswered || timeLeft <= 0;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => submitAnswer(currentQuestionId, i)}
                          disabled={disabled}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                            selected
                              ? "border-[var(--accent)] bg-[var(--bg-ter)] text-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                              : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)] text-[var(--txt)] hover:border-[var(--accent)]/30 hover:bg-[var(--bg-ter)]/60"
                          } ${disabled && !selected ? "opacity-50" : ""} ${
                            disabled ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              selected
                                ? "bg-[var(--btn)] text-white"
                                : "bg-[var(--bg-ter)] text-[var(--accent)]"
                            }`}
                          >
                            {OPTION_LETTERS[i] || i + 1}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {selected && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {alreadyAnswered && (
                    <p className="mt-3 text-center text-xs font-semibold text-[var(--txt-disabled)]">
                      Answer locked in — waiting for the next question…
                    </p>
                  )}
                </div>
              ) : (
                /* Waiting for first question to arrive */
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--accent)]" />
                  </span>
                  <p className="text-sm font-semibold text-[var(--txt-dim)]">
                    Loading your first question…
                  </p>
                </div>
              )}

              {/* ── RIGHT: Live Leaderboard ── */}
              <div className="rounded-2xl border border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-ter)]/40 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <h2 className="text-sm font-extrabold text-[var(--txt)]">Live Leaderboard</h2>
                </div>

                {leaderboard.length === 0 ? (
                  <p className="text-center text-xs text-[var(--txt-disabled)] py-4">
                    Waiting for scores…
                  </p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((u, idx) => {
                      const isMe = u.username === username;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                            idx === 0
                              ? "border-amber-200 bg-gradient-to-r from-amber-50 to-[var(--bg-ter)]"
                              : isMe
                              ? "border-[var(--accent)]/30 bg-[var(--bg-sec)]"
                              : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-ter)] text-xs font-bold text-[var(--accent)]">
                              {idx === 0 ? (
                                <Crown className="h-3.5 w-3.5 text-amber-500" />
                              ) : idx === 1 ? (
                                <Medal className="h-3.5 w-3.5 text-slate-400" />
                              ) : idx === 2 ? (
                                <Medal className="h-3.5 w-3.5 text-amber-700" />
                              ) : (
                                `#${idx + 1}`
                              )}
                            </span>
                            <span className="text-xs font-semibold text-[var(--txt)] truncate max-w-[100px]">
                              {u.username}
                              {isMe && (
                                <span className="ml-1.5 rounded-full bg-[var(--bg-ter)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--accent)]">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-[var(--accent)] shrink-0">
                            {u.score} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── COMPLETED: Final Leaderboard (full width) ── */}
          {contestCompleted && (
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-extrabold text-[var(--txt)]">Final Leaderboard</h2>
              </div>

              {leaderboard.length === 0 && (
                <p className="text-center text-sm text-[var(--txt-disabled)]">
                  Waiting for leaderboard…
                </p>
              )}

              {/* Podium — top 3 */}
              {leaderboard.length > 0 && (
                <div className="mb-6 flex items-end justify-center gap-3 sm:gap-4">
                  {[1, 0, 2]
                    .filter((i) => leaderboard[i])
                    .map((i) => {
                      const u = leaderboard[i];
                      const isMe = u.username === username;
                      const podium = {
                        0: {
                          height: "h-32",
                          ring: "ring-amber-300",
                          badge: "bg-gradient-to-br from-amber-400 to-amber-300",
                          bar: "bg-[var(--btn)]",
                        },
                        1: {
                          height: "h-24",
                          ring: "ring-slate-300",
                          badge: "bg-gradient-to-br from-slate-300 to-slate-200",
                          bar: "bg-[var(--bg-ter)]",
                        },
                        2: {
                          height: "h-16",
                          ring: "ring-amber-700/40",
                          badge: "bg-gradient-to-br from-amber-700 to-amber-600",
                          bar: "bg-[var(--bg-ter)]/70",
                        },
                      }[i];

                      return (
                        <div key={i} className="flex w-24 flex-col items-center sm:w-28">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md ring-4 ${podium.ring} ${podium.badge}`}
                          >
                            {i === 0 ? (
                              <Crown className="h-6 w-6" />
                            ) : (
                              <Medal className="h-5 w-5" />
                            )}
                          </div>
                          <p className="mt-2 w-full truncate text-center text-sm font-bold text-[var(--txt)]">
                            {u.username}
                          </p>
                          {isMe && (
                            <span className="mt-0.5 rounded-full bg-[var(--bg-ter)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">
                              You
                            </span>
                          )}
                          <p className="mt-0.5 text-sm font-extrabold text-[var(--accent)]">
                            {u.score} pts
                          </p>
                          <div
                            className={`mt-2 flex w-full ${podium.height} items-start justify-center rounded-t-2xl ${podium.bar} pt-1.5`}
                          >
                            <span className="text-sm font-extrabold text-white">
                              #{i + 1}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Remaining ranks */}
              <div className="space-y-2">
                {leaderboard.slice(3).map((u, idx) => {
                  const i = idx + 3;
                  const isMe = u.username === username;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                        isMe
                          ? "border-[var(--accent)]/30 bg-[var(--bg-ter)]/40"
                          : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-ter)] text-sm font-bold text-[var(--accent)]">
                          #{i + 1}
                        </span>
                        <span className="text-sm font-semibold text-[var(--txt)]">
                          {u.username}
                          {isMe && (
                            <span className="ml-2 rounded-full bg-[var(--bg-ter)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-[var(--accent)]">
                        {u.score} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ENDED (not yet marked completed by this client) ── */}
          {status === "ended" && !contestCompleted && (
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-extrabold text-[var(--txt)]">Leaderboard</h2>
              </div>

              {leaderboard.length === 0 ? (
                <p className="text-center text-sm text-[var(--txt-disabled)]">
                  Waiting for leaderboard…
                </p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((u, idx) => {
                    const isMe = u.username === username;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                          idx === 0
                            ? "border-amber-200 bg-gradient-to-r from-amber-50 to-[var(--bg-ter)]"
                            : isMe
                            ? "border-[var(--accent)]/30 bg-[var(--bg-ter)]/40"
                            : "border-[color:rgba(var(--shadow-rgb),0.15)] bg-[var(--bg-sec)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-ter)] text-sm font-bold text-[var(--accent)]">
                            {idx === 0 ? (
                              <Crown className="h-4 w-4 text-amber-500" />
                            ) : idx === 1 ? (
                              <Medal className="h-4 w-4 text-slate-400" />
                            ) : idx === 2 ? (
                              <Medal className="h-4 w-4 text-amber-700" />
                            ) : (
                              `#${idx + 1}`
                            )}
                          </span>
                          <span className="text-sm font-semibold text-[var(--txt)]">
                            {u.username}
                            {isMe && (
                              <span className="ml-2 rounded-full bg-[var(--bg-ter)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">
                                You
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-sm font-extrabold text-[var(--accent)]">
                          {u.score} pts
                        </span>
                      </div>
                    );
                  })}
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