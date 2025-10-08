import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LandingPage from './Components/LandingPage/student_dashboard'
import HostWait from './Components/WaitingLobby/HostWaitingLobby'
import StudentWait from './Components/WaitingLobby/WaitingLobby'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {

  return (
    <>
     <Router>
      <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/hostwait' element={<HostWait/>}/>
      <Route path='/studwait' element={<StudentWait/>}/>
      </Routes>
      </Router>
    </>
  )
}

export default App
