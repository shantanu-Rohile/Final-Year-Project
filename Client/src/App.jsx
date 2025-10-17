import LandingPage from "./Page/StdDashboard";
import HostWait from "./Page/WaitingLobby/HostWaitingLobby";
import StudentWait from "./Page/WaitingLobby/WaitingLobby";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomPage from "./Page/RoomsPage";
// import Test from './Components/Test'
import FinalLeaderboard from "./Page/Session/FinalLeaderboard";


import QuizTest from "./Page/Session/Quiz";
import AboutUs from "./Page/AboutUs";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        
          <Route path="/hostwait" element={<HostWait />} />
          <Route path="/studwait" element={<StudentWait />} />
          <Route path="/session" element={<RoomPage />} />
          <Route path="/quiz-test/:roomId" element={<QuizTest />} />
          <Route path="/final-leaderboard" element={<FinalLeaderboard />} />
          <Route path="/Page" element={<AboutUs/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
