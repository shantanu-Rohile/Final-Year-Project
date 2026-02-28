// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

// Pages
// "Dashboard" is our post-login home experience
import Dashboard from "./Page/Home";
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
import PublicRoute from "./context/PublicRoute";

//Session pages
import { AuthProvider } from "./context/AuthContext";
import Quiz from "./Page/Session/Quiz";
import CreateRoom from "./Page/Session/CreateRoom";
import Main from "./Page/Real-Time/Main.jsx";
import Room from "./Page/Real-Time/Room.jsx"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ---------------- PUBLIC ---------------- */}
          {/* At "/" we show login (if already logged in, redirect to /dashboard) */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* -------- PROTECTED (WITH SIDEBAR) ------- */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Home after login */}
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session" element={<Session />} />
            <Route path="/aboutus" element={<AboutUs />} />
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

            {/* Real-time rooms (Socket.IO) */}
            <Route path="/realRoom/:userId" element={<Main />} />
            <Route path="/room/:userId/:roomId" element={<Room />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
