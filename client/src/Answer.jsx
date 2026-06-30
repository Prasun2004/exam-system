import React, { useState, useEffect } from 'react';
import "./style/Answer.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const stateResult = location.state?.result;
  const [result, setResult] = useState(stateResult || null);
  
  // New States for AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const fetchResult = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/${id}`);
      setResult(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchResult();
    }
  }, []);

  // Function to request AI Breakdown
  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError("");
    setAiAnalysis("");

    try {
      // Replace with your actual AI backend endpoint
      const response = await axios.post("http://localhost:8080/ai-analysis", {
        score: result.marks || result.scoreRaw,
        percentage: result.percentage,
        questions: result.details ?? result.detailedResults ?? [],
        topic: result.topic
      });

      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
      setAiError("Failed to generate AI Analysis. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // NO RESULT
  if (!result) {
    return (
      <div className="result-container">
        <h2>No Result Found</h2>
        <button className="submit-btn" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  const score = result.marks || result.scoreRaw;
  const reviewData = result.details ?? result.detailedResults ?? [];

  return (
    <div className="result-container">
      {/* RESULT CARD */}
      <div className="result-card">
        <h2>Result</h2>
        <p>Score: {score}</p>
        <p>Percentage: {result.percentage}%</p>
        <p className={Number(result.percentage) >= 70 ? "good" : "bad"}>
          {Number(result.percentage) >= 80 ? "Good Job 🎉" : "Needs Improvement ❌"}
        </p>

        <div className="btn-group" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="submit-btn" onClick={() => navigate("/")}>
            Go Home
          </button>
          
          {/* NEW AI ANALYSIS BUTTON */}
          <button 
            className="ai-btn" 
            onClick={handleAiAnalysis}
            disabled={isAiLoading}
          >
            {isAiLoading ? "Analyzing Performance..." : "✨ Get AI Analysis"}
          </button>
        </div>
      </div>

      {/* NEW AI ANALYSIS DISPLAY SECTION */}
      {(isAiLoading || aiAnalysis || aiError) && (
        <div className="ai-analysis-section">
          <h3>🧠 AI Performance Insight</h3>
          {isAiLoading && <div className="loader">AI is crunching your score stats...</div>}
          {aiError && <p className="error-text">{aiError}</p>}
          {aiAnalysis && (
            <div className="ai-response-box">
              {/* If your backend returns markdown text, whitespace wrapping will preserve structure */}
              <p style={{ whiteSpace: "pre-line" }}>{aiAnalysis}</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION PERFORMANCE */}
      <div className="section-result">
        <h3>Section Performance</h3>
        {Object.entries(result.sectionStats || {}).map(([section, data]) => (
          <div key={section} className="section-card">
            <h4>{section}</h4>
            <p>Correct: {data.correct}</p>
            <p>Wrong: {data.wrong}</p>
            <p>Attempted: {data.attempted}</p>
            <p>Total: {data.total}</p>
            <p>Percentage: {data.percentage}%</p>
          </div>
        ))}
      </div>

      {/* ANSWER REVIEW */}
      <div className="review-section">
        <h3 style={{ color: "black" }}>Answer Review</h3>
        {reviewData.map((q) => (
          <div key={q.id} className={`review-card ${q.status}`}>
            <h4>{q.id}. {q.question}</h4>
            <p><strong>Your Answer:</strong> {q.userAnswer || "Not Attempted"}</p>
            <p><strong>Correct Answer:</strong> {q.answer}</p>
            <p className="status">
              {q.status === "correct" && "✅ Correct"}
              {q.status === "wrong" && "❌ Wrong"}
              {q.status === "unattempted" && "⏭ Unattempted"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}