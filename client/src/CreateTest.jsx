import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./style/LandingPage.css"; // Reuse or create a dedicated CSS file

export default function CreateTest() {
  const navigate = useNavigate();
  
  // Configuration States
  const [topic, setTopic] = useState("");
  const [totalTime, setTotalTime] = useState(2400); // Default 40 mins
  const [numQuestions, setNumQuestions] = useState(5);
  const [creationMode, setCreationMode] = useState("manual"); // 'manual' or 'ai'
  
  // Manual Mode State
  const [manualJson, setManualJson] = useState("");
  
  // AI Mode States
  const [difficulty, setDifficulty] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  
    const leaderboard = () => {

    navigate("/leaderboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Please enter a test topic.");
      return;
    }

    setIsLoading(true);
    setError("");

    if (creationMode === "manual") {
      try {
        const parsedQuestions = JSON.parse(manualJson);
        if (!Array.isArray(parsedQuestions)) throw new Error("Must be an array");
        
        // Pass the manually created test configuration to your ExamPage
        navigate("/exam", { 
          state: { topic, totalTime, customQuestions: parsedQuestions } 
        });
      } catch (err) {
        setError("Invalid JSON format. Please ensure it is an array of question objects.");
        setIsLoading(false);
      }
    } else {
      // AI Mode: Fetch dynamically from Gemini Backend
      try {
        const response = await axios.post("http://localhost:8080/api/generate-questions", {
          topic,
          numQuestions,
          difficulty
        });
        
        console.log(response.data);
        // Redirect directly to your test room with the fresh AI questions
        navigate("/exam", { 
          state: { topic, totalTime, customQuestions: response.data.questions } 
        });
      } catch (err) {
        console.error(err);
        setError("AI Generation failed. Check backend connection.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="app-container" style={{ padding: "40px 20px" ,flexDirection:"column"}}>
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left", marginBottom:"5px"}}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🛠️ Quiz Creator Studio</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Common Settings */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Exam Topic:</label>
            <input 
              type="text" 
              placeholder="e.g. JavaScript Basics, English Verbs"
              value={topic} 
              onChange={(e) => setTopic(e.target.value)}
              style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
            <div style={{ width:"100%", overflow:"hidden" }}>
              <label style={{ fontWeight: "bold" }}>Total Time (seconds):</label>
              <input 
                type="number" 
                value={totalTime} 
                onChange={(e) => setTotalTime(Number(e.target.value))}
                style={{ width: "80%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc", overflow:"hidden" }}
              />
            </div>
            <div style={{ width:"100%", overflow:"hidden" }}>
              <label style={{ fontWeight: "bold" }}>No. of Questions:</label>
              <input 
                type="number" 
                value={numQuestions} 
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" ,overflow:"hidden" }}
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
            <button 
              type="button"
              onClick={() => setCreationMode("manual")}
              className={`nav-btn ${creationMode === "manual" ? "active" : ""}`}
              style={{ flex: 1, backgroundColor: creationMode === "manual" ? "#4CAF50" : "#ccc" }}
            >
              ✍️ Manual JSON Field
            </button>
            <button 
              type="button"
              onClick={() => setCreationMode("ai")}
              className={`nav-btn ${creationMode === "ai" ? "active" : ""}`}
              style={{ flex: 1, backgroundColor: creationMode === "ai" ? "#6a11cb" : "#ccc" }}
            >
              ✨ Smart AI Generation
            </button>
          </div>

          {/* Conditional Rendering Area */}
          {creationMode === "manual" ? (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Paste Array Data (JSON format):</label>
              <textarea 
                rows="8"
                placeholder={`[\n  {\n    "id": 1,\n    "section": "General",\n    "question": "Sample Question Text?",\n    "options": ["A", "B", "C", "D"],\n    "answer": "A"\n  }\n]`}
                value={manualJson}
                onChange={(e) => setManualJson(e.target.value)}
                style={{ width: "100%", fontFamily: "monospace", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: "20px", background: "#f3f0ff", padding: "15px", borderRadius: "6px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Target Complexity Level:</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="easy">🟢 Easy (Foundational Concepts)</option>
                <option value="medium">🟡 Medium (Intermediate Evaluation)</option>
                <option value="hard">🔴 Hard (Advanced Logical Deductions)</option>
              </select>
            </div>
          )}

          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              width: "100%", 
              padding: "12px", 
              background: creationMode === 'ai' ? 'linear-gradient(135deg, #6a11cb, #2575fc)' : '#4CAF50',
              color: 'white', 
              border: "none", 
              borderRadius: "5px", 
              fontWeight: "bold", 
              cursor: "pointer" 
            }}
          >
            {isLoading ? "Assembling Your Test Workspace..." : "🚀 Launch Configured Test"}
          </button>
        </form>
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