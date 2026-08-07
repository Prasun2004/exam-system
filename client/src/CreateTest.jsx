import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./style/LandingPage.css";

const topicData = {
  Technical: {
    "Clinical Biochemistry": [
      "Biomolecules", "Enzymes", "Carbohydrate Metabolism", "Protein Metabolism",
      "Lipid Metabolism", "Water & Electrolyte Balance", "Acid-Base Balance",
      "Vitamins & Minerals", "Clinical Enzymology", "Cardiac Markers",
      "Liver Function Test (LFT)", "Renal Function Test (RFT)", "Endocrine Function Test",
      "Quality Control & Quality Assurance", "Laboratory Instruments"
    ],
    Hematology: [
      "Structure & Function of Blood", "RBC Indices & ESR", "WBC & Differential Count",
      "Hemoglobinopathies", "Anemias", "Bleeding Disorders", "Coagulation & Anticoagulants",
      "Platelets & Platelet Disorders", "Bone Marrow Examination", "Blood Grouping & Rh Typing",
      "Cross Matching", "Transfusion Medicine", "Hematology Analyzers"
    ],
    Microbiology: [
      "General Microbiology", "Bacteriology", "Culture Media", "Sterilization",
      "Biochemical Tests", "Immunology", "Serology", "Parasitology", "Mycology",
      "Mycobacteriology", "Virology"
    ],
    "Clinical Pathology": [
      "Urine Examination", "Stool Examination", "Body Fluids", "Semen Analysis",
      "Pregnancy Tests", "Occult Blood Test"
    ],
    "Cytopathology & Histopathology": [
      "Fixatives", "Tissue Processing", "Microtomy", "Staining Techniques",
      "Frozen Section", "Cytology", "Biopsy"
    ],
    "Immunohematology & Transfusion Medicine": [
      "ABO Blood Group", "Rh Blood Group", "Blood Components", "Component Separation",
      "Blood Storage", "Compatibility Testing", "Hemolytic Disease of Newborn",
      "Transfusion Reactions"
    ],
    "Molecular Biology & Biotechnology": [
      "DNA", "RNA", "PCR", "ELISA", "Blotting Techniques", "Gene Cloning"
    ],
    "Laboratory Management": [
      "Laboratory Safety", "Biomedical Waste Management", "Quality Assurance",
      "NABL", "Ethics", "Documentation"
    ],
    "Anatomy, Physiology & Health Education": [
      "Cell", "Tissues", "Blood", "Digestive System", "Respiratory System",
      "Cardiovascular System", "Urinary System", "Nervous System", "Health Education"
    ],
    "Instrumentation & Techniques": [
      "Microscope", "Centrifuge", "Colorimeter", "Spectrophotometer",
      "Auto Analyzer", "Electrophoresis"
    ],
    "Computer Application in Laboratory": [
      "Computer Basics", "MS Office", "Laboratory Information System (LIS)",
      "Internet", "Medical Records"
    ]
  },
  "Non-Technical": {
    "General Knowledge & Aptitude": [
      "History", "Geography", "Indian Polity", "Economics",
      "General Science", "Current Affairs", "Computer Awareness"
    ],
    Mathematics: [
      "Number System", "Simplification", "Percentage", "Ratio & Proportion",
      "Average", "Profit & Loss", "Simple Interest", "Compound Interest",
      "Time & Work", "Time, Speed & Distance", "Data Interpretation"
    ],
    Reasoning: [
      "Analogy", "Classification", "Series", "Coding-Decoding", "Blood Relation",
      "Direction Sense", "Puzzle", "Seating Arrangement", "Syllogism",
      "Statement & Conclusion"
    ]
  }
};

export default function CreateTest() {
  const navigate = useNavigate();

  // ===== States =====
  const [examType, setExamType] = useState("CRE");
  const [topic, setTopic] = useState("");
  const [totalTime, setTotalTime] = useState(2400);
  const [numQuestions, setNumQuestions] = useState(5);
  const [creationMode, setCreationMode] = useState("manual");
  const [manualJson, setManualJson] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("Technical");
  const [subject, setSubject] = useState(Object.keys(topicData["Technical"])[0]);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);
  const [showSubTopics, setShowSubTopics] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSubTopics(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean selected topics when subject/category changes
  useEffect(() => {
    setSelectedSubTopics((prev) =>
      prev.filter((item) => topicData[category][subject]?.includes(item))
    );
  }, [category, subject]);

  const handleSubTopicChange = (item) => {
    setSelectedSubTopics((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  };

  const handleSelectAll = () => {
    setSelectedSubTopics([...topicData[category][subject]]);
  };

  const handleClearAll = () => {
    setSelectedSubTopics([]);
  };

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

        navigate("/exam", {
          state: { topic, totalTime, difficulty, customQuestions: parsedQuestions },
        });
      } catch (err) {
        setError("Invalid JSON format. Please ensure it is an array of question objects.");
        setIsLoading(false);
      }
    } else {
      try {
        const response = await axios.post("http://localhost:8080/api/generate-questions", {
          topic,
          numQuestions,
          difficulty,
        });

        navigate("/exam", {
          state: { topic, totalTime, difficulty, customQuestions: response.data.questions },
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
    <div className="app-container" style={{ padding: "40px 20px", flexDirection: "column" }}>
      <div
        className="card"
        style={{ maxWidth: "700px", margin: "0 auto", textAlign: "left", marginBottom: "5px" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🛠️ Quiz Creator Studio</h2>

        <form onSubmit={handleSubmit}>
          {/* Exam Type */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <b>Exam</b>
            </label>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setExamType("CRE")}
                className={examType === "CRE" ? "active-btn" : ""}
              >
                CRE
              </button>
              <button
                type="button"
                onClick={() => setExamType("RRB")}
                className={examType === "RRB" ? "active-btn" : ""}
              >
                RRB
              </button>
            </div>
          </div>

          {/* Category / Subject / Sub Topics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.4fr",
              gap: "20px",
              alignItems: "start",
              marginBottom: "24px",
            }}
          >
            {/* Category */}
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategory(value);
                  setSubject(Object.keys(topicData[value])[0]);
                  setSelectedSubTopics([]);
                }}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                <option value="Technical">🖥️ Technical</option>
                <option value="Non-Technical">📘 Non-Technical</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setSelectedSubTopics([]);
                }}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                {Object.keys(topicData[category]).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Topics */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                Select Sub Topics
              </label>

              <div
                onClick={() => setShowSubTopics(!showSubTopics)}
                style={{
                  width: "100%",
                  minHeight: "44px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  cursor: "pointer",
                  background: "#fff",
                }}
              >
                <div style={{ flex: 1, overflow: "hidden" }}>
                  {selectedSubTopics.length === 0 ? (
                    <span style={{ color: "#9ca3af", fontSize: 14 }}>Select Sub Topics</span>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {selectedSubTopics.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item}
                        </span>
                      ))}
                      {selectedSubTopics.length > 3 && (
                        <span
                          style={{
                            background: "#f3f4f6",
                            color: "#4b5563",
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: "12px",
                          }}
                        >
                          +{selectedSubTopics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span style={{ marginLeft: 8, color: "#6b7280", fontSize: 12 }}>
                  {showSubTopics ? "▲" : "▼"}
                </span>
              </div>

              {showSubTopics && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 6,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    zIndex: 1000,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderBottom: "1px solid #f3f4f6",
                      background: "#f9fafb",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                      {selectedSubTopics.length} selected
                    </span>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          fontSize: 13,
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          fontSize: 13,
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div style={{ maxHeight: "240px", overflowY: "auto", padding: "6px 0" }}>
                    {topicData[category][subject].map((item) => (
                      <label
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "10px 14px",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubTopics.includes(item)}
                          onChange={() => handleSubTopicChange(item)}
                          style={{
                            width: 16,
                            height: 16,
                            marginRight: 10,
                            accentColor: "#2563eb",
                            cursor: "pointer",
                          }}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time + Difficulty */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
            <div style={{ width: "100%" }}>
              <label style={{ fontWeight: "bold" }}>Total Time (seconds):</label>
              <input
                type="number"
                value={totalTime}
                onChange={(e) => setTotalTime(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ width: "100%" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                Target Complexity Level:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
            <button
              type="button"
              onClick={() => setCreationMode("manual")}
              style={{
                flex: 1,
                backgroundColor: creationMode === "manual" ? "#4CAF50" : "#ccc",
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ✍️ Manual JSON Field
            </button>
            <button
              type="button"
              onClick={() => setCreationMode("ai")}
              style={{
                flex: 1,
                backgroundColor: creationMode === "ai" ? "#6a11cb" : "#ccc",
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ✨ Smart AI Generation
            </button>
          </div>

          {/* Conditional Area */}
          {creationMode === "manual" ? (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                Paste Array Data (JSON format):
              </label>
              <textarea
                rows="8"
                placeholder={`[\n  {\n    "id": 1,\n    "section": "General",\n    "question": "Sample Question Text?",\n    "options": ["A", "B", "C", "D"],\n    "answer": "A"\n  }\n]`}
                value={manualJson}
                onChange={(e) => setManualJson(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "monospace",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                marginBottom: "20px",
                background: "#f3f0ff",
                padding: "15px",
                borderRadius: "6px",
              }}
            >
              <label style={{ fontWeight: "bold" }}>No. of Questions:</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}

          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              background:
                creationMode === "ai"
                  ? "linear-gradient(135deg, #6a11cb, #2575fc)"
                  : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {isLoading ? "Assembling Your Test Workspace..." : "🚀 Launch Configured Test"}
          </button>
        </form>
      </div>

      <button onClick={leaderboard} className="submit-btn">
        LeaderBoard
      </button>
    </div>
  );
}