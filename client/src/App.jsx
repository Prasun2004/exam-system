import './App.css';
import Answer from './Answer';
import { Routes, Route } from "react-router-dom";
import ExamPage from './ExamPage';
import LeaderBoard from './LeaderBoard';
import CreateTest from './CreateTest';
import Auth from './Auth';
import QuestionCard from './QuestionCard';

function App() {
 

  return (
    <>
      <Routes>
        <Route path="/" element={<Auth/>} />
        <Route path="/exam/:id" element={<ExamPage />}/>
        <Route path="/result" element={<Answer/>} />
        <Route path='/question' element={<QuestionCard/>}/>
        <Route path="/CreateTest" element={<CreateTest/>} />
        <Route path="/leaderboard" element={<LeaderBoard/>} />
        <Route path="/result/:id" element={<Answer/>}/>
      </Routes>
    </>
  )
}

export default App
