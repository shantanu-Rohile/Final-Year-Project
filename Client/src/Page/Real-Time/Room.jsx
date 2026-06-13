import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { Loader2, Trophy } from "lucide-react";

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
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-200">
            <Trophy className="h-8 w-8 text-white" />
            <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 animate-spin text-purple-500" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Loading room…</p>
        </div>
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