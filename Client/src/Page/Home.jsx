import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Post-login home page (plain + sober)
export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const joinRoom = (e) => {
    e.preventDefault();
    if (!user?.id || !roomId.trim()) return;
    navigate(`/room/${user.id}/${roomId.trim().toUpperCase()}`);
    setRoomId("");
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--txt)" }}
    >
      <main>
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-4xl font-bold">
            Welcome{user?.username ? `, ${user.username}!` : ""}
          </h1>
          <p className="mt-2 text-[var(--txt)] opacity-80">
            EduQuest is an AI-powered quiz generator with real-time assessment
            rooms.
          </p>

          <div
            className="mt-6 rounded-[var(--radius)] border p-6"
            style={{
              backgroundColor: "var(--bg-sec)",
              borderColor: "rgba(var(--shadow-rgb),0.2)",
            }}
          >
            <h2 className="text-2xl font-bold">How to use</h2>
            <ol
              className="mt-3 list-decimal list-inside space-y-2"
              style={{ color: "var(--txt-dim)" }}
            >
              <li>
                Go to{" "}
                <span className="font-medium" style={{ color: "var(--txt)" }}>
                  Session
                </span>{" "}
                to practice quizzes.
              </li>
              <li>
                Go to{" "}
                <span className="font-medium" style={{ color: "var(--txt)" }}>
                  Real-time Room
                </span>{" "}
                to host or join live assessments.
              </li>
              <li>
                Explore{" "}
                <span className="font-medium" style={{ color: "var(--txt)" }}>
                  Settings
                </span>{" "}
                to customize themes and update your password.
              </li>
            </ol>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickCard
              title="Practice Session"
              desc="Generate questions and start a session."
              button="Go to Session"
              onClick={() => navigate("/session")}
            />

            <QuickCard
              title="Host Real-time Room"
              desc="Create a room and share the Room ID."
              button="Open Real-time"
              onClick={() => user?.id && navigate(`/realRoom/${user.id}`)}
              disabled={!user?.id}
            />

            <div
              className="rounded-[var(--radius)] border p-5"
              style={{
                backgroundColor: "var(--bg-sec)",
                borderColor: "rgba(var(--shadow-rgb),0.2)",
              }}
            >
              <h3 className="font-bold text-lg pb-2">Join Room</h3>
              <p className="mt-1 text-sm text-[var(--txt)] opacity-80">
                Enter a room ID to participate.
              </p>
              <form onSubmit={joinRoom} className="mt-4 flex gap-2">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Room ID"
                  className="flex-1 rounded-[var(--radius)] border px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-ter)",
                    borderColor: "rgba(var(--shadow-rgb),0.25)",
                    color: "var(--txt)",
                  }}
                />
                <button
                  type="submit"
                  disabled={!user?.id}
                  className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: "var(--btn)", color: "white" }}
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickCard({ title, desc, button, onClick, disabled }) {
  return (
    <div
      className="rounded-[var(--radius)] border p-6"
      style={{
        backgroundColor: "var(--bg-sec)",
        borderColor: "rgba(var(--shadow-rgb),0.2)",
      }}
    >
      <h3 className="font-bold text-lg pb-2">{title}</h3>
      <p className="mt-1 text-sm text-[var(--txt)] opacity-80">{desc}</p>
      <button
        onClick={onClick}
        disabled={disabled}
        className="mt-4 w-full rounded-[var(--radius)] px-3 py-2 text-sm font-medium disabled:opacity-50"
        style={{ backgroundColor: "var(--btn)", color: "white" }}
      >
        {button}
      </button>
    </div>
  );
}
