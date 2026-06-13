import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { Hourglass, Users, KeyRound, Loader2, Trophy } from "lucide-react";
import { API_URL, SOCKET_URL } from "../../../config/backend.js";
import { useAuth } from "../../../context/AuthContext.jsx";

const AVATAR_COLORS = [
  "from-purple-500 to-fuchsia-500",
  "from-violet-500 to-purple-400",
  "from-fuchsia-500 to-pink-400",
  "from-purple-400 to-indigo-400",
];

function avatarColor(seed) {
  const code = String(seed)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function WaitingLobby() {
  const { roomId } = useParams();
  const { user } = useAuth();

  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    axios
      .get(`${API_URL}/api/real-rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setRoomData(res.data);
        setParticipants(
          (res.data.participants || []).map((p) => ({
            userId: p.userId,
            username: p.username || "Anonymous",
          }))
        );
      })
      .catch((err) => {
        console.error("Error fetching room:", err);
      })
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !user?.id) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("Join-Room", {
      roomId,
      username: user?.username || "Anonymous",
    });

    socketRef.current.on("participants-updated", (list) => {
      setParticipants(list || []);
    });

    return () => socketRef.current?.disconnect();
  }, [roomId, user?.id, user?.username]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-sm font-semibold text-slate-500">Loading lobby…</p>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
        <p className="text-sm font-semibold text-slate-500">Room not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-200/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-100 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-3xl border border-purple-100 bg-white p-6 shadow-[0_10px_40px_-15px_rgba(124,58,237,0.25)] sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-200">
              <Hourglass className="h-7 w-7 animate-pulse text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Waiting Lobby</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hi {user?.username || "Player"}, hang tight — the host will start
              the contest soon.
            </p>
          </div>

          {/* Room info chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 font-semibold text-purple-700">
              <Trophy className="h-3.5 w-3.5" />
              {roomData.roomName}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 font-semibold uppercase tracking-wider text-purple-700">
              <KeyRound className="h-3.5 w-3.5" />
              {roomId}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 font-semibold text-purple-700">
              <Users className="h-3.5 w-3.5" />
              {participants.length} {participants.length === 1 ? "Player" : "Players"}
            </span>
          </div>

          <div className="my-6 h-px bg-purple-100" />

          {/* Participants */}
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Players in Lobby
          </h3>

          {participants.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 px-4 py-8 text-center">
              <Users className="h-6 w-6 text-purple-300" />
              <p className="text-sm text-slate-400">Waiting for players to join…</p>
            </div>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {participants.map((p, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/30 px-3 py-2.5"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(
                      p.userId || p.username
                    )} text-sm font-bold text-white`}
                  >
                    {(p.username || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {p.username}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      ID: {String(p.userId).slice(-6)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status footer */}
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
            </span>
            Waiting for host to start the contest…
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaitingLobby;