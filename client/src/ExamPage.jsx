import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const totalSections = 5;
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
      const topic = subjects
        .flatMap((s) => s.subTopics || [])
        .filter(Boolean)
        .join(", ");

      const payload = {
        difficulty,
        examType,
        topic,
        marks: resultData.scoreRaw,
        percentage: Number(resultData.percentage),
        details: resultData.detailedResults,
        sectionStats: resultData.sectionStats,
      };

      const res = await fetch("http://localhost:8080/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
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

  // ========== NO QUESTIONS ==========
  if (!questionsData.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No questions found</h2>
          <p className="text-gray-600 mb-6">Please go back and generate the quiz again.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Skip empty section
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 max-w-xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-3xl mb-4">
              📋
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Ready to begin the Test?</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Exam Type: <span className="font-medium text-gray-700">{examType || "—"}</span>
              {" · "}
              Difficulty: <span className="font-medium text-gray-700">{difficulty || "—"}</span>
              {" · "}
              Questions: <span className="font-medium text-gray-700">{totalQuestions}</span>
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Subject
            </h3>

            {subjects.length === 0 ? (
              <p className="text-gray-400 text-sm">No subjects selected</p>
            ) : (
              <div className="space-y-3">
                {subjects.map((s, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  >
                    <div className="font-semibold text-gray-900 text-sm">{s.category}</div>
                    <div className="text-gray-600 text-sm mt-0.5">{s.subject}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-amber-800">
              This exam requires a secure monitoring layout. Clicking below will activate
              full-screen mode. Exiting full-screen will log a security violation.
            </p>
          </div>

          <button
            onClick={startExamFlow}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            Start Test & Enter Fullscreen
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
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Section {currentSection + 1} / {totalSections}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900 tabular-nums">
                    ⏱ {formatTime(timeLeft)}
                  </span>
                  {timeLeft <= 60 && (
                    <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Low time
                    </span>
                  )}
                </div>
              </div>

              {/* <button
                onClick={handleNextSection}
                disabled={timeLeft > 0 && currentSection < totalSections - 1}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${
                  timeLeft > 0 && currentSection < totalSections - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                }`}
              >
                {currentSection === totalSections - 1
                  ? "Submit Test"
                  : timeLeft > 0
                  ? `Next Section (${formatTime(timeLeft)})`
                  : "Next Section"}
              </button> */}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug mb-6">
              {currentQuestion.id}. {currentQuestion.question}
            </h2>

           <div className="space-y-3">
  {currentQuestion.options.map((opt) => {
    const isSelected = answers[currentQuestion.id] === opt;

    return (
      <label
        key={opt}
        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition select-none ${
          isSelected
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleSelect(currentQuestion.id, opt)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span
          className={`text-sm sm:text-base ${
            isSelected ? "text-blue-900 font-medium" : "text-gray-700"
          }`}
        >
          {opt}
        </span>
      </label>
    );
  })}
</div>

            {/* Navigation */}
<div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
  {/* Previous - only show if not first question */}
  {currentQuestionIndex > 0 ? (
    <button
      onClick={handlePrevQuestion}
      className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
    >
      Previous
    </button>
  ) : (
    <div className="w-[100px]" /> // empty spacer to keep layout balanced
  )}

  <span className="text-sm font-medium text-gray-500">
    Question {currentQuestionIndex + 1} / {sectionQuestions.length}
  </span>

  {/* Next - only show if not last question */}
  {currentQuestionIndex < sectionQuestions.length - 1 ? (
    <button
      onClick={handleNextQuestion}
      className="px-5 py-2.5 rounded-xl font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white transition"
    >
      Next
    </button>
  ) : (
    <div className="w-[100px]" /> // empty spacer
  )}
</div>
          </div>
        </div>
      </div>
    </ExamSecurityWrapper>
  );
}