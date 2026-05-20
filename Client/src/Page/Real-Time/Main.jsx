import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { API_URL, SOCKET_URL } from "../../config/backend.js";
import { useAuth } from "../../context/AuthContext.jsx";

function Main() {
  const { userId: userIdFromUrl } = useParams();
  const { user } = useAuth();

  // Prefer the id from backend (AuthContext). URL id is only for routing.
  const userId = user?.id || userIdFromUrl;

  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
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
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomId) return;

    try {
      const trimmedRoomId = roomId.trim().toUpperCase();
      // Check if room exists before navigating
      await axios.get(`${API_URL}/api/real-rooms/${trimmedRoomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      navigate(`/room/${userId}/${trimmedRoomId}`);
      setRoomId("");
    } catch (err) {
      console.error("Join Error:", err);
      alert(err?.response?.data?.message || "Room does not exist or failed to join");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--txt)" }}
    >
      <div
        className="w-full max-w-lg rounded-[var(--radius)] border p-6 shadow"
        style={{ backgroundColor: "var(--bg-sec)", borderColor: "rgba(var(--shadow-rgb),0.2)" }}
      >
        <h2 className="text-xl font-semibold">Real-time Room</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--txt-dim)" }}>
          Create a room to host, or join using an existing Room ID.
        </p>

        {/* CREATE */}
        <div className="mt-6">
          <h3 className="font-semibold">Create Room</h3>
          <form onSubmit={handleCreateRoom} className="mt-3 space-y-3">
            <input
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="w-full rounded-[var(--radius)] border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "var(--bg-ter)", borderColor: "rgba(var(--shadow-rgb),0.25)", color: "var(--txt)" }}
            />
            <button
              type="submit"
              className="w-full rounded-[var(--radius)] px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: "var(--btn)", color: "white" }}
            >
              Create Room
            </button>
          </form>
        </div>

        <div className="my-6 h-px" style={{ backgroundColor: "rgba(var(--shadow-rgb),0.2)" }} />

        {/* JOIN */}
        <div>
          <h3 className="font-semibold">Join Room</h3>
          <form onSubmit={handleJoinRoom} className="mt-3 space-y-3">
            <input
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="w-full rounded-[var(--radius)] border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "var(--bg-ter)", borderColor: "rgba(var(--shadow-rgb),0.25)", color: "var(--txt)" }}
            />
            <button
              type="submit"
              className="w-full rounded-[var(--radius)] border px-3 py-2 text-sm font-medium hover:opacity-90"
              style={{ borderColor: "rgba(var(--shadow-rgb),0.35)", color: "var(--txt)" }}
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Main;
