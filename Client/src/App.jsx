import { useState } from 'react'
import LandingPage from './Page/StdDashboard'
import HostWait from './Page/WaitingLobby/HostWaitingLobby'
import StudentWait from './Page/WaitingLobby/WaitingLobby'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Test from './Components/Test'

function App() {

  return (
    <>
     <Router>
      <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/test' element={<Test/>}/>
      <Route path='/hostwait' element={<HostWait/>}/>
      <Route path='/studwait' element={<StudentWait/>}/>
      </Routes>
      </Router>
    </>
  )
}

export default App
