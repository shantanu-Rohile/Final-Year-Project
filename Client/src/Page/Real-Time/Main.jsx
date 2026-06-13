import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { Trophy, Swords, KeyRound, Sparkles, ArrowRight, Crown } from "lucide-react";
import { API_URL, SOCKET_URL } from "../../config/backend.js";
import { useAuth } from "../../context/AuthContext.jsx";

function Main() {
  const { userId: userIdFromUrl } = useParams();
  const { user } = useAuth();

  // Prefer the id from backend (AuthContext). URL id is only for routing.
  const userId = user?.id || userIdFromUrl;

  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [creating, setCreating] = useState(false);
  const socketRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.on("connect", () => {
      // console.log("Socket connected", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err?.message || err);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/real-rooms/create`,
        { roomName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const createdRoomId = res.data.roomId;
      setRoomName("");
      navigate(`/room/${userId}/${createdRoomId}`);
    } catch (err) {
      console.error("Creation Error:", err);
      alert(err?.response?.data?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomId) return;
    navigate(`/room/${userId}/${roomId.trim().toUpperCase()}`);
    setRoomId("");
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-200/60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-100 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-fuchsia-100 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Header / Hero */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-600">
            <Sparkles className="h-3.5 w-3.5" />
            Contest Arena
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ready to{" "}
            <span className="bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
              Play?
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-500">
            Host your own contest and lead the leaderboard, or jump into an
            existing battle with a Room ID.
          </p>
        </div>

        {/* Cards */}
        <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
          {/* CREATE ROOM — HOST */}
          <div className="group relative rounded-3xl border border-purple-100 bg-white p-6 shadow-[0_10px_40px_-15px_rgba(124,58,237,0.25)] transition-transform hover:-translate-y-1">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow-lg shadow-purple-200">
                <Crown className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Host Mode
              </span>
            </div>

            <h3 className="text-lg font-bold">Create a Room</h3>
            <p className="mt-1 text-sm text-slate-500">
              Set up a new arena, invite players, and become the host.
            </p>

            <form onSubmit={handleCreateRoom} className="mt-5 space-y-3">
              <input
                placeholder="Name your arena"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                className="w-full rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 transition active:scale-[0.98] disabled:opacity-60"
              >
                <Trophy className="h-4 w-4" />
                {creating ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>

          {/* JOIN ROOM — PLAYER */}
          <div className="group relative rounded-3xl border border-purple-100 bg-white p-6 shadow-[0_10px_40px_-15px_rgba(124,58,237,0.25)] transition-transform hover:-translate-y-1">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Swords className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Player Mode
              </span>
            </div>

            <h3 className="text-lg font-bold">Join a Room</h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter a Room ID shared by the host to jump into the action.
            </p>

            <form onSubmit={handleJoinRoom} className="mt-5 space-y-3">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300" />
                <input
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/40 pl-10 pr-4 py-2.5 text-sm uppercase tracking-wider text-slate-800 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-purple-600 transition hover:bg-purple-50 active:scale-[0.98]"
              >
                Join Room
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
        <button
          onClick={() => navigate(`/Home`)}
          className="mt-6 mx-auto block rounded-xl border border-purple-200 bg-white px-6 py-2.5 text-sm font-semibold text-purple-600 transition-all duration-200 hover:border-purple-300 hover:bg-purple-50"
        >
          Home
        </button>

        {/* Footer hint */}
        <p className="mt-8 text-xs text-slate-400">
          Tip: Room IDs are short codes shared by your host — case doesn't matter.
        </p>
      </div>

    </div>
  );
}

export default Main;