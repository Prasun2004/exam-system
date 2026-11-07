import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { calculateResult } from "./componat/Calculator.js";
import ExamSecurityWrapper from "./Security.jsx";
import api from "./componat/api.js";

export default function ExamPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // EXAM DATA FROM API
  // =====================================================

  const [exam, setExam] = useState(null);
  const [questionsData, setQuestionsData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [totalTime, setTotalTime] = useState(2400);
  const [difficulty, setDifficulty] = useState("");
  const [examType, setExamType] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // =====================================================
  // EXAM STATE
  // =====================================================

  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // =====================================================
  // REFS
  // =====================================================

  const timerRef = useRef(null);
  const isSubmitting = useRef(false);
  const timerStartedRef = useRef(false);

  // =====================================================
  // FETCH EXAM BY ID
  // =====================================================

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setLoadError("");

        console.log("Fetching exam:", id);

        const response = await api.get(`/result/generated-exams/${id}`);

        console.log("Exam API response:", response.data);

        if (!response.data?.success) {
          throw new Error(
            response.data?.error || "Failed to load exam"
          );
        }

        const examData = response.data.exam;

        setExam(examData);
        setQuestionsData(examData.questions || []);
        setSubjects(examData.subjects || []);
        setTotalTime(Number(examData.totalTime) || 2400);
        setDifficulty(examData.difficulty || "");
        setExamType(examData.examType || "");
      } catch (error) {
        console.error("Fetch exam error:", error);

        setLoadError(
          error.response?.data?.error ||
            error.message ||
            "Failed to load exam"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExam();
    }
  }, [id]);

  // =====================================================
  // EXAM CALCULATIONS
  // =====================================================

  const totalQuestions = questionsData.length;
  const totalSections = 5;

  const sectionSize =
    totalQuestions > 0
      ? Math.ceil(totalQuestions / totalSections)
      : 1;

  const sectionTime = Math.floor(totalTime / totalSections);

  // =====================================================
  // CURRENT SECTION QUESTIONS
  // =====================================================

  const startIndex = currentSection * sectionSize;
  const endIndex = startIndex + sectionSize;

  const sectionQuestions = questionsData.slice(startIndex, endIndex);

  const currentQuestion = sectionQuestions[currentQuestionIndex];

  // =====================================================
  // TIMER SETUP (runs when section changes or exam starts)
  // =====================================================

  useEffect(() => {
    if (!hasStarted) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset flags & state for the new section
    timerStartedRef.current = false;
    setTimeLeft(sectionTime);
    setCurrentQuestionIndex(0);

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Mark timer as started on next tick
    // so the auto-advance effect does NOT fire with the old timeLeft === 0
    const t = setTimeout(() => {
      timerStartedRef.current = true;
    }, 0);

    return () => {
      clearTimeout(t);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentSection, hasStarted, sectionTime]);

  // =====================================================
  // AUTO ADVANCE WHEN TIME REACHES 0
  // =====================================================

  useEffect(() => {
    // Only react after the timer has actually started AND reached 0
    if (!hasStarted || !timerStartedRef.current || timeLeft > 0) {
      return;
    }

    // Time is up for this section
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerStartedRef.current = false; // prevent double fire

    if (currentSection < totalSections - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [timeLeft, hasStarted, currentSection]);

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // =====================================================
  // SELECT ANSWER
  // =====================================================

  const handleSelect = (qid, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: prev[qid] === option ? "" : option,
    }));
  };

  // =====================================================
  // PREVIOUS QUESTION
  // =====================================================

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // =====================================================
  // NEXT QUESTION
  // =====================================================

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // =====================================================
  // NEXT SECTION (manual)
  // =====================================================

  const handleNextSection = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerStartedRef.current = false;

    if (currentSection < totalSections - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  // =====================================================
  // SEND RESULT TO API
  // =====================================================

  const sendToAPI = async (resultData) => {
    try {
      const topic = subjects
        .flatMap((s) => s.subTopics || [])
        .filter(Boolean)
        .join(", ");

      const payload = {
        examId: id,
        difficulty,
        examType,
        topic,
        marks: resultData.scoreRaw,
        percentage: Number(resultData.percentage),
        details: resultData.detailedResults,
        sectionStats: resultData.sectionStats,
      };

      console.log("Submitting result:", payload);

      const response = await api.post("/result/submit", payload);

      console.log("Result saved:", response.data);

      return response.data;
    } catch (error) {
      console.error("Submit API error:", error);

      if (error.response?.status === 401) {
        navigate("/", { replace: true });
        return null;
      }

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Submission failed";

      setSubmitError(message);
      return null;
    }
  };

  // =====================================================
  // SUBMIT EXAM
  // =====================================================

  const handleSubmit = useCallback(async () => {
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setSubmitError("");

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerStartedRef.current = false;

    const result = calculateResult(questionsData, answers, examType);

    const apiData = await sendToAPI(result);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    if (apiData) {
      navigate("/result", {
        state: {
          result: {
            ...result,
            ...apiData,
          },
          subjects,
          examId: id,
        },
      });
      return;
    }

    alert(submitError || "Submission failed. Please try again.");
    isSubmitting.current = false;
  }, [
    questionsData,
    answers,
    examType,
    subjects,
    id,
    navigate,
    submitError,
  ]);

  // =====================================================
  // START EXAM
  // =====================================================

  const startExamFlow = async () => {
    const elem = document.documentElement;

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }

      setHasStarted(true);
    } catch (error) {
      console.error("Fullscreen error:", error);
      alert(
        "Please allow Fullscreen permissions to take the assessment."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-3">
            Unable to Load Exam
          </h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <button
            onClick={() => navigate("/question")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO QUESTIONS
  // =====================================================

  if (!questionsData.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            No questions found
          </h2>
          <p className="text-gray-600 mb-6">
            This exam does not contain any questions.
          </p>
          <button
            onClick={() => navigate("/question")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // START SCREEN
  // =====================================================

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 max-w-xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-3xl mb-4">
              📋
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Ready to begin the Test?
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Exam Type:{" "}
              <span className="font-medium text-gray-700">
                {examType || "—"}
              </span>
              {" · "}
              Difficulty:{" "}
              <span className="font-medium text-gray-700">
                {difficulty || "—"}
              </span>
              {" · "}
              Questions:{" "}
              <span className="font-medium text-gray-700">
                {totalQuestions}
              </span>
            </p>
          </div>

          {/* EXAM TITLE */}
          {exam?.title && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Exam
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="font-semibold text-gray-900">{exam.title}</p>
              </div>
            </div>
          )}

          {/* SUBJECTS */}
          {/* SUBJECTS */}
<div className="mb-8">
  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
    Subjects
  </h3>
  <div className="space-y-3">
    {subjects.map((s, i) => (
      <div
        key={i}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
      >
        <div className="font-semibold text-gray-900 text-sm">
          {s.category}
        </div>
        <div className="text-gray-600 text-sm mt-0.5">
          {s.subject}
        </div>

        {/* Sub-topics */}
        {Array.isArray(s.subTopics) && s.subTopics.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {s.subTopics.map((topic, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
</div>

          {/* EXAM INFO */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Questions</p>
              <p className="text-lg font-bold text-gray-900">
                {totalQuestions}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.floor(totalTime / 60)} mins
              </p>
            </div>
          </div>

          {/* SECURITY */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-amber-800">
              This exam requires a secure monitoring layout. Clicking
              below will activate full-screen mode. Exiting full-screen
              will log a security violation.
            </p>
          </div>

          {/* START */}
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

  // =====================================================
  // MAIN EXAM
  // =====================================================

  // Safety: if somehow no question (edge case)
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading question...</p>
      </div>
    );
  }

  return (
    <ExamSecurityWrapper
      active={hasStarted}
      onAutoSubmit={handleSubmit}
      maxViolations={1}
    >
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 mb-6">
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

          {/* QUESTION */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">  
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug mb-6">
              {currentQuestion.id}. {currentQuestion.question}
            </h2>

            {/* OPTIONS */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected =
                  answers[currentQuestion.id] === opt;

                return (
                  <label
                    key={opt}
                    className={`
                      flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition select-none
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        handleSelect(currentQuestion.id, opt)
                      }
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={
                        isSelected
                          ? "text-blue-900 font-medium"
                          : "text-gray-700"
                      }
                    >
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* NAVIGATION */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {currentQuestionIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
                >
                  Previous
                </button>
              ) : (
                <div className="w-[100px]" />
              )}

              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1} /{" "}
                {sectionQuestions.length}
              </span>

             {currentQuestionIndex < sectionQuestions.length - 1 ? (
  <button
    type="button"
    onClick={handleNextQuestion}
    className="px-5 py-2.5 rounded-xl font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white transition"
  >
    Next
  </button>
) : currentSection === totalSections - 1 ? (
  <button
    type="button"
    onClick={handleSubmit}
    className="px-5 py-2.5 rounded-xl font-medium text-sm bg-green-600 hover:bg-green-700 text-white transition"
  >
    Submit Test
  </button>
) : null}
            </div>

            {submitError && (
              <div className="mt-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ExamSecurityWrapper>
  );
}