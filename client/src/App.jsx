import './App.css';
import Question from './Question';
import LandingPage from './LandingPage';
import Answer from './Answer';
import { Routes, Route, Link } from "react-router-dom";
import ExamPage from './ExamPage';
import LeaderBoard from './LeaderBoard';
import CreateTest from './CreateTest';

function App() {
 

  return (
    <>
      <Routes>
        <Route path="/exam" element={<ExamPage/>} />
        <Route path="/result" element={<Answer/>} />
        <Route path="/" element={<CreateTest/>} />
        <Route path="/leaderboard" element={<LeaderBoard/>} />
        <Route path="/result/:id" element={<Answer/>}/>
      </Routes>
    </>
  )
}

export default App
