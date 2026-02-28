import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import WaitingLobby from "./Room/WaitingLobby";
import HostInterface from "./Room/HostInterface";
import Participant from "./Room/Participant";
import { API_URL, SOCKET_URL } from "../../config/backend.js";
import { useAuth } from "../../context/AuthContext.jsx";

function Room() {
  const { userId, roomId } = useParams();
  const { user } = useAuth();

  const [status, setStatus] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const effectiveUserId = user?.id || userId;

  useEffect(() => {
    (async () => {
      try {
        const roomRes = await axios.get(`${API_URL}/api/real-rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setStatus(roomRes.data.status);
        setHostId(roomRes.data.host);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  // Keep room status in sync via socket events
  useEffect(() => {
    if (!roomId || !effectiveUserId) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("Join-Room", {
      roomId,
      username: user?.username || "Anonymous",
    });

    socketRef.current.on("sync-state", (s) => {
      if (s?.status) setStatus(s.status);
      if (s?.hostId) setHostId(s.hostId);
    });

    socketRef.current.on("contest-started", () => setStatus("live"));
    socketRef.current.on("contest-ended", () => setStatus("ended"));

    return () => socketRef.current?.disconnect();
  }, [roomId, effectiveUserId, user?.username]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)", color: "var(--txt)" }}>
        <p style={{ color: "var(--txt-dim)" }}>Loading room…</p>
      </div>
    );

  const isHost = hostId && String(hostId) === String(effectiveUserId);

  return (
    <>
      {isHost && status === "waiting" && <HostInterface />}
      {!isHost && status === "waiting" && <WaitingLobby />}
      {status === "live" && <Participant />}
      {status === "ended" && <Participant />}
    </>
  );
}

export default Room;
