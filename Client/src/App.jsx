// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

// Pages
import LandingPage from "./Page/StdDashboard";
import HostWait from "./Page/WaitingLobby/HostWaitingLobby";
import StudentWait from "./Page/WaitingLobby/WaitingLobby";
import RoomPage from "./Page/RoomsPage";
import QuizTest from "./Page/Session/Quiz";
import FinalLeaderboard from "./Page/Session/FinalLeaderboard";
import AboutUs from "./Page/AboutUs";
import Lobby from "./Page/Session/lobby";
import Settings from "./Page/Settings";
function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Sidebar */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/session" element={<RoomPage />} />
          <Route path="/Page" element={<AboutUs />} />
          <Route path="/lobby" element={<Lobby />} />
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
