// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

// Pages
import Dashboard from "./Page/StdDashboard";
import HostWait from "./Page/WaitingLobby/HostWaitingLobby";
import StudentWait from "./Page/WaitingLobby/WaitingLobby";
import Session from "./Page/Session";
import FinalLeaderboard from "./Page/Session/FinalLeaderboard";
import AboutUs from "./Page/AboutUs";
import Settings from "./Page/Settings";

import Home from "./Page/Home";
import Login from "./Page/Auth/Login";
import Signup from "./Page/Auth/Signup";
import ProtectedRoute from "./context/ProtectedRoute";
import NoSidebarLayout from "./context/NoSidebarLayout";

//Session pages
import { AuthProvider } from "./context/AuthContext";
import Quiz from "./Page/Session/Quiz";
import CreateRoom from "./Page/Session/CreateRoom";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ---------------- PUBLIC ---------------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* -------- PROTECTED (WITH SIDEBAR) ------- */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session" element={<Session />} />
            <Route path="/aboutus" element={<AboutUs />} />
            {/* <Route path="/create-session" element={<CreateSession />} /> */}
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* ------ PROTECTED (NO SIDEBAR) ------ */}
          <Route
            element={
              <ProtectedRoute>
                <NoSidebarLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/create-room/:roomId" element={<CreateRoom />} />
            <Route
              path="/final-leaderboard/:roomId"
              element={<FinalLeaderboard />}
            />
            <Route path="/quiz/:roomId" element={<Quiz />} />

            <Route path="/hostwait" element={<HostWait />} />
            <Route path="/studwait" element={<StudentWait />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
