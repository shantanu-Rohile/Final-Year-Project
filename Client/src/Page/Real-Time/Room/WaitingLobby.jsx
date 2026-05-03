import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { API_URL, SOCKET_URL } from "../../../config/backend.js";
import { useAuth } from "../../../context/AuthContext.jsx";

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)", color: "var(--txt)" }}>
        <p style={{ color: "var(--txt-dim)" }}>Loading lobby…</p>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)", color: "var(--txt)" }}>
        <p style={{ color: "var(--txt-dim)" }}>Room not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-primary)", color: "var(--txt)" }}>
      <div className="w-full max-w-2xl rounded-[var(--radius)] border p-6" style={{ backgroundColor: "var(--bg-sec)", borderColor: "rgba(var(--shadow-rgb),0.2)" }}>
        <h2 className="text-xl font-semibold">Waiting Lobby</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--txt-dim)" }}>
          Hi {user?.username || "Player"}. Please wait for the host to start the contest.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border px-3 py-1" style={{ borderColor: "rgba(var(--shadow-rgb),0.25)", backgroundColor: "var(--bg-ter)", color: "var(--txt)" }}>
            Room: {roomData.roomName}
          </span>
          <span className="rounded-full border px-3 py-1" style={{ borderColor: "rgba(var(--shadow-rgb),0.25)", backgroundColor: "var(--bg-ter)", color: "var(--txt)" }}>
            ID: {roomId}
          </span>
          <span className="rounded-full border px-3 py-1" style={{ borderColor: "rgba(var(--shadow-rgb),0.25)", backgroundColor: "var(--bg-ter)", color: "var(--txt)" }}>
            Participants: {participants.length}
          </span>
        </div>

        <div className="my-5 h-px" style={{ backgroundColor: "rgba(var(--shadow-rgb),0.2)" }} />

        <h3 className="font-semibold">Participants</h3>
        {participants.length === 0 ? (
          <p className="mt-2 text-sm" style={{ color: "var(--txt-dim)" }}>Waiting for players to join…</p>
        ) : (
          <div className="mt-3 space-y-2">
            {participants.map((p, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-[var(--radius)] border px-3 py-2"
                style={{ backgroundColor: "var(--bg-ter)", borderColor: "rgba(var(--shadow-rgb),0.2)" }}
              >
                <span className="text-sm">{p.username}</span>
                <span className="text-xs" style={{ color: "var(--txt-dim)" }}>{String(p.userId)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingLobby;
