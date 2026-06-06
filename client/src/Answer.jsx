import React from 'react'
import "./style/Answer.css"
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useState, useEffect,useRef } from "react";
import axios from "axios";

export default function ResultPage() {

  const location = useLocation();

  const navigate = useNavigate();

  const { id } = useParams();

  const stateResult =
    location.state?.result;
   
      const [result, setResult] =
    useState(stateResult || null);

     const fetchResult = async () => {

    try {

      const res = await axios.get(
        `http://localhost:8080/${id}`
      );

      setResult(res.data);

    } catch (err) {

      console.log(err);

    }

  };

    useEffect(() => {

    // IF OPENED FROM LEADERBOARD
    // FETCH BY ID
    if (id) {
      fetchResult();
    }

  }, []);
  // NO RESULT
  if (!result) {

    return (
      <div className="result-container">

        <h2>No Result Found</h2>

        <button
          className="submit-btn"
          onClick={() =>
            navigate("/")
          }
        >
          Go Home
        </button>

      </div>
    );
  }
   

  // SCORE
  const score =
    result.marks ||
    result.scoreRaw;

  // REVIEW DATA
  const reviewData =
    result.details ??
    result.detailedResults ??
    [];

  return (
    <div className="result-container">

      {/* RESULT CARD */}
      <div className="result-card">

        <h2>Result</h2>

        <p>
          Score: {score}
        </p>

        <p>
          Percentage:
          {" "}
          {result.percentage}%
        </p>

        <p
          className={
            Number(
              result.percentage
            ) >= 70
              ? "good"
              : "bad"
          }
        >

          {Number(
            result.percentage
          ) >= 80
            ? "Good Job 🎉"
            : "Needs Improvement ❌"}

        </p>

        {/* HOME BUTTON */}
        <button
          className="submit-btn"
          onClick={() =>
            navigate("/")
          }
        >
          Go Home
        </button>

      </div>

      {/* SECTION PERFORMANCE */}
      <div className="section-result">

        <h3>
          Section Performance
        </h3>

        {Object.entries(
          result.sectionStats || {}
        ).map(
          ([section, data]) => (
            <div
              key={section}
              className="section-card"
            >

              <h4>
                {section}
              </h4>

              <p>
                Correct:
                {" "}
                {data.correct}
              </p>

              <p>
                Wrong:
                {" "}
                {data.wrong}
              </p>

              <p>
                Attempted:
                {" "}
                {data.attempted}
              </p>

              <p>
                Total:
                {" "}
                {data.total}
              </p>

              <p>
                Percentage:
                {" "}
                {data.percentage}%
              </p>

            </div>
          )
        )}

      </div>

      {/* ANSWER REVIEW */}
      <div className="review-section">

        <h3
          style={{
            color: "black",
          }}
        >
          Answer Review
        </h3>

        {reviewData.map((q) => (

          <div
            key={q.id}
            className={`review-card ${q.status}`}
          >

            <h4>
              {q.id}.
              {" "}
              {q.question}
            </h4>

            <p>

              <strong>
                Your Answer:
              </strong>

              {" "}

              {q.userAnswer ||
                "Not Attempted"}

            </p>

            <p>

              <strong>
                Correct Answer:
              </strong>

              {" "}

              {q.answer}

            </p>

            <p className="status">

              {q.status ===
                "correct" &&
                "✅ Correct"}

              {q.status ===
                "wrong" &&
                "❌ Wrong"}

              {q.status ===
                "unattempted" &&
                "⏭ Unattempted"}

            </p>

          </div>
        ))}

      </div>

    </div>
  );
}