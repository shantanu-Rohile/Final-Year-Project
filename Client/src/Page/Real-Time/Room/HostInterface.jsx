import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_URL, SOCKET_URL } from "../../../config/backend.js";
import { useAuth } from "../../../context/AuthContext.jsx";

function HostInterface() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);

  // ---------- FORM STATE ----------
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [marks, setMarks] = useState(1);
  const [timeLimit, setTimeLimit] = useState(30);

  // ---------- QUESTIONS ----------
  const [questions, setQuestions] = useState([]);

  // ---------- OPTION CHANGE ----------
  const handleOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // ---------- ADD SINGLE QUESTION ----------
  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (correctOptionIndex === null) {
      alert("Please select correct option");
      return;
    }

    if (options.some((opt) => opt.trim() === "")) {
      alert("All options are required");
      return;
    }

    if (timeLimit < 5) {
      alert("Time limit must be at least 5 seconds");
      return;
    }

    const questionPayload = {
      questionText: question,
      options: options.map((opt) => ({ text: opt })),
      correctOptionIndex,
      marks,
      timeLimit,
    };

    const updatedQuestions = [...questions, questionPayload];
    setQuestions(updatedQuestions);

    // Prevent cross-contest collisions by scoping localStorage to the room
    localStorage.setItem(`questionSet_${roomId}`, JSON.stringify(updatedQuestions));

    // Reset form
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(null);
    setMarks(1);
    setTimeLimit(30);
  };

  // ---------- SUBMIT ALL QUESTIONS ----------
  const handleOnSubmitQuestion = async () => {
    try {
      if (questions.length === 0) {
        alert("Add questions before submitting");
        return;
      }

      await axios.post(
        `${API_URL}/api/real-rooms/${roomId}/questions`,
        { questions },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.removeItem(`questionSet_${roomId}`);
      alert("Questions submitted successfully");

      // navigate(`/host/${id}/lobby`) // optional
    } catch (err) {
      console.error(err);
      alert("Failed to submit questions");
    }
  };

  // ---------- LOAD FROM LOCAL STORAGE ----------
  useEffect(() => {
    const storedQuestions = localStorage.getItem(`questionSet_${roomId}`);
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
  }, [roomId]);

  // Socket: join room, keep participant list updated, and start contest
  useEffect(() => {
    if (!roomId || !user?.id) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("Join-Room", {
      roomId,
      username: user?.username || "Host",
    });

    socketRef.current.on("participants-updated", (list) => {
      setParticipants(list || []);
    });

    return () => socketRef.current?.disconnect();
  }, [roomId, user?.id, user?.username]);

  const handleStartContest = () => {
    socketRef.current?.emit("start-contest", { roomId });
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: "var(--bg-primary)", color: "var(--txt)" }}>
      <div className="w-full max-w-4xl rounded-[var(--radius)] border p-6" style={{ backgroundColor: "var(--bg-sec)", borderColor: "rgba(var(--shadow-rgb),0.2)" }}>
        <h1 className="text-center mb-3">Room ID: {roomId}</h1>
        <h2 className="text-center mb-4">Host Panel</h2>

        {/* ---------- ADD QUESTION FORM ---------- */}
        <Form onSubmit={handleOnSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              placeholder="Enter question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </Form.Group>

          {options.map((option, index) => (
            <div key={index} className="d-flex align-items-center gap-2 mb-2">
              <Form.Control
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOption(index, e.target.value)}
                required
              />
              <Form.Check
                type="radio"
                name="correctOption"
                checked={correctOptionIndex === index}
                onChange={() => setCorrectOptionIndex(index)}
                label="Correct"
                style={{ color: "var(--txt)" }}
              />
            </div>
          ))}

          <Form.Group className="mb-3 mt-3">
            <Form.Label>Marks</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              style={{ width: "120px" }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Time Limit (seconds)</Form.Label>
            <Form.Control
              type="number"
              min={5}
              max={300}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              style={{ width: "150px" }}
            />
          </Form.Group>

          <Button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#ff9f1a",
              border: "none",
              padding: "12px",
              fontWeight: "600",
            }}
          >
            Add Question
          </Button>
        </Form>

        {/* ---------- DIVIDER ---------- */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.3)",
            margin: "2.5rem 0",
          }}
        />

        {/* ---------- QUESTION LIST ---------- */}
        <h4 className="mb-3">Added Questions</h4>

        {questions.length === 0 && (
          <p style={{ opacity: 0.7 }}>No questions added yet.</p>
        )}

        {questions.map((q, index) => (
          <div
            key={index}
            style={{
              background: "rgba(0,0,0,0.35)",
              padding: "1.2rem",
              borderRadius: "12px",
              marginBottom: "1rem",
            }}
          >
            <h5>
              {index + 1}. {q.questionText}
            </h5>

            <ul>
              {q.options.map((opt, i) => (
                <li key={i}>
                  {opt.text}
                  {q.correctOptionIndex === i && " ✅"}
                </li>
              ))}
            </ul>

            <p>Marks: {q.marks}</p>
            <p>Time Limit: ⏱ {q.timeLimit}s</p>
          </div>
        ))}

        {/* ---------- SUBMIT ALL ---------- */}
        <Button
          onClick={handleOnSubmitQuestion}
          style={{
            width: "100%",
            marginTop: "1rem",
            backgroundColor: "#2ecc71",
            border: "none",
            padding: "12px",
            fontWeight: "600",
          }}
        >
          Submit All Questions
        </Button>

        {/* ---------- PLAYERS & START ---------- */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.3)",
            margin: "2.5rem 0",
          }}
        />

        <h4 className="mb-3">Participants ({participants.length})</h4>

        {participants.length === 0 && (
          <p style={{ opacity: 0.7 }}>Waiting for players to join...</p>
        )}

        {participants.map((p, i) => (
          <div
            key={i}
            style={{
              background: "rgba(0,0,0,0.35)",
              padding: "0.9rem 1.2rem",
              borderRadius: "10px",
              marginBottom: "0.6rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{p.username || "Anonymous"}</span>
            <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>
              {String(p.userId)}
            </span>
          </div>
        ))}

        <Button
          onClick={handleStartContest}
          style={{
            width: "100%",
            marginTop: "1rem",
            backgroundColor: "#3498db",
            border: "none",
            padding: "12px",
            fontWeight: "600",
          }}
          disabled={questions.length === 0}
        >
          Start Contest
        </Button>
      </div>
    </div>
  );
}

export default HostInterface;
