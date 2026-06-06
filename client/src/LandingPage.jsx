import React, { useState } from 'react'
import "./style/LandingPage.css";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

  const [topic, setTopic] =
    useState("");

  const navigate = useNavigate();

  const startExam = () => {

    navigate("/exam", {
      state: {
        topic,
      },
    });
  };

    const leaderboard = () => {

    navigate("/leaderboard");
  };

  return (
    <div className="start-container">

      <div className="start-card">

        <h2>Enter Topic</h2>

        <input
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
          className='input'
        />

        <button
          disabled={!topic}
          onClick={startExam}
          className="submit-btn"
        >
          Start Test
        </button>

      </div>

       <button
          onClick={leaderboard}
          className="submit-btn"
        >
          LeaderBoard
        </button>
    </div>
  );
}