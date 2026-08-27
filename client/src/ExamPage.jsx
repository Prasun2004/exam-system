import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./style/Question.css";
import { calculateResult } from "./componat/Calculator.js";
import ExamSecurityWrapper from "./Security.jsx";

export default function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const questionsData = location.state?.customQuestions || [];
  const totalTime = location.state?.totalTime || 2400;
  const difficulty = location.state?.difficulty || "";
  const examType = location.state?.examType || "";
  const subjects = location.state?.subjects || [];

  const totalQuestions = questionsData.length;
  const totalSections = 5; // always 5 sections
  const sectionSize = Math.ceil(totalQuestions / totalSections);
  const sectionTime = Math.floor(totalTime / totalSections);

  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(sectionTime);
  const [hasStarted, setHasStarted] = useState(false);

  const timerRef = useRef(null);
  const isSubmitting = useRef(false);

  const startIndex = currentSection * sectionSize;
  const endIndex = startIndex + sectionSize;
  const sectionQuestions = questionsData.slice(startIndex, endIndex);
  const currentQuestion = sectionQuestions[currentQuestionIndex];

  const currentSubjectName =
    subjects[currentSection]?.subject || `Section ${currentSection + 1}`;
  const currentCategory = subjects[currentSection]?.category || "";

  // Timer
  useEffect(() => {
    if (!hasStarted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(sectionTime);
    setCurrentQuestionIndex(0);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentSection, hasStarted, sectionTime]);

  useEffect(() => {
    if (!hasStarted || timeLeft > 0) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentSection < totalSections - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [timeLeft, hasStarted]);

  const formatTime = (time) => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelect = (qid, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: prev[qid] === option ? "" : option,
    }));
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((p) => p - 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sectionQuestions.length - 1)
      setCurrentQuestionIndex((p) => p + 1);
  };

  const handleNextSection = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentSection < totalSections - 1) {
      setCurrentSection((p) => p + 1);
    } else {
      handleSubmit();
    }
  };

  const sendToAPI = async (resultData) => {
    try {
      // topic = all subject names joined (Technical + Non-Technical)
      const topic = subjects
        .map((s) => s.subject)
        .filter(Boolean)
        .join(", ");

      const payload = {
        subjects,
        difficulty,
        examType,
        topic,
        marks: resultData.scoreRaw,
        percentage: Number(resultData.percentage),
        details: resultData.detailedResults,
        sectionStats: resultData.sectionStats,
      };

      console.log("Final payload →", payload);

      const res = await fetch("http://localhost:8080/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(res);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error(errorText || "Submission failed");
      }

      return await res.json();
    } catch (err) {
      console.error("Submit failed:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    const result = calculateResult(questionsData, answers, examType);
    const apiData = await sendToAPI(result);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    if (apiData) {
      navigate("/result", {
        state: { result: { ...result, ...apiData }, subjects },
      });
    } else {
      alert("Submission Failed");
      isSubmitting.current = false;
    }
  };

  const startExamFlow = async () => {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
      setHasStarted(true);
    } catch {
      alert("Please allow Fullscreen permissions to take the assessment.");
    }
  };

  if (!questionsData.length) {
    return (
      <div className="app-container" style={{ textAlign: "center", padding: 40 }}>
        <h2>No questions found</h2>
        <p>Please go back and generate the quiz again.</p>
      </div>
    );
  }

  // Skip empty section automatically
  if (!currentQuestion && hasStarted) {
    if (currentSection < totalSections - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      handleSubmit();
    }
    return null;
  }

  // ========== START SCREEN ==========
  if (!hasStarted) {
    return (
      <div
        className="app-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: 20,
        }}
      >
        <div
          className="card"
          style={{ textAlign: "center", padding: 40, maxWidth: 600, width: "100%" }}
        >
          <h2 style={{ marginBottom: 8 }}>📋 Ready to begin the Test?</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Exam Type: <strong>{examType || "—"}</strong> &nbsp;|&nbsp;
            Difficulty: <strong>{difficulty || "—"}</strong> &nbsp;|&nbsp;
            Questions: <strong>{totalQuestions}</strong>
          </p>

          <div style={{ textAlign: "left", marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, color: "#333" }}>
              Selected Subjects
            </h3>

            {subjects.length === 0 ? (
              <p style={{ color: "#888" }}>No subjects selected</p>
            ) : (
              subjects.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {s.category}
                  </div>
                  <div style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>
                    {s.subject}
                  </div>
                </div>
              ))
            )}
          </div>

          <p style={{ margin: "0 0 20px", color: "#666", fontSize: 14 }}>
            This exam requires a secure monitoring layout. Clicking below will
            activate full-screen mode. Exiting full-screen will log a security
            violation.
          </p>

          <button
            onClick={startExamFlow}
            className="section-btn"
            style={{ width: "100%", padding: "14px", fontSize: 16 }}
          >
            🚀 Start Test & Enter Fullscreen
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN EXAM UI ==========
  return (
    <ExamSecurityWrapper
      active={hasStarted}
      onAutoSubmit={handleSubmit}
      maxViolations={1}
    >
      <div className="app-container">
        <div className="card">
          <div className="header">
            <div>
              <h3>
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: 14,
                    color: "#666",
                    marginLeft: 8,
                  }}
                >
                  (Section {currentSection + 1}/{totalSections})
                </span>
              </h3>
              <div className="timer">⏱ {formatTime(timeLeft)}</div>
            </div>

            <button
              className="section-btn"
              onClick={handleNextSection}
              disabled={timeLeft > 0}
            >
              {currentSection === totalSections - 1
                ? "Submit Test"
                : timeLeft > 0
                ? `Next Section (${formatTime(timeLeft)})`
                : "Next Section"}
            </button>
          </div>

          <div className="question">
            <h2>
              {currentQuestion.id}. {currentQuestion.question}
            </h2>
            {currentQuestion.options.map((opt) => (
              <label key={opt} className="option">
                <input
                  type="checkbox"
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() => handleSelect(currentQuestion.id, opt)}
                />
                {opt}
              </label>
            ))}
          </div>

          <div className="question-nav">
            <button
              className="nav-btn"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <span className="question-count">
              Question {currentQuestionIndex + 1} / {sectionQuestions.length}
            </span>
            <button
              className="nav-btn"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === sectionQuestions.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </ExamSecurityWrapper>
  );
}