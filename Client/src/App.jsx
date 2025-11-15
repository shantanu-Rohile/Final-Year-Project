// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

// Pages
import Dashboard from "./Page/StdDashboard";
import HostWait from "./Page/WaitingLobby/HostWaitingLobby";
import StudentWait from "./Page/WaitingLobby/WaitingLobby";
import RoomPage from "./Page/RoomsPage";
import QuizTest from "./Page/Session/Quiz";
import FinalLeaderboard from "./Page/Session/FinalLeaderboard";
import AboutUs from "./Page/AboutUs";
import CreateSession from "./Page/Session/CreateSession";

import Settings from "./Page/Settings";

import Home from "./Page/Home";
import Login from "./Page/Login/Login";
import Signup from "./Page/Login/Signup";
import ProtectedRoutes from "./Components/ProtectedRoutes";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/hostwait" element={<HostWait />} />
        <Route path="/studwait" element={<StudentWait />} />

        {/* Protected routes (inside layout) */}
        <Route
          element={
            <ProtectedRoutes>
              <Layout />
            </ProtectedRoutes>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/session" element={<RoomPage />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/create-session" element={<CreateSession />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Routes without Sidebar */}
        <Route path="/quiz-test/:roomId" element={<QuizTest />} />
        <Route path="/final-leaderboard" element={<FinalLeaderboard />} />
        <Route path="/hostwait" element={<HostWait />} />
        <Route path="/studwait" element={<StudentWait />} />
      </Routes>
    </Router>
  );
}

export default App;
