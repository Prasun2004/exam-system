import React, {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "./componat/api";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // RESULT
  // =====================================================

  const stateResult = location.state?.result || null;
  const [result, setResult] = useState(stateResult);

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  // =====================================================
  // AI ANALYSIS
  // =====================================================

  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // =====================================================
  // FETCH RESULT FROM SERVER
  // =====================================================

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/result/result_details/${id}`);

      if (!response.data) {
        throw new Error("Result not found");
      }

      // If API wraps the document (e.g. { success, result })
      // take the real document, otherwise use response.data directly
      const data = response.data.result || response.data.data || response.data;

      setResult(data);
    } catch (err) {
      console.error("Fetch result error:", err);

      if (err.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message || "Unable to load result."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH RESULT WHEN ID EXISTS
  // =====================================================

  useEffect(() => {
    if (id) {
      fetchResult();
    } else {
      setLoading(false);
    }
  }, [id]);

  // =====================================================
  // AI ANALYSIS
  // =====================================================

  const handleAiAnalysis = async () => {
    if (!result) return;

    setIsAiLoading(true);
    setAiError("");
    setAiAnalysis("");

    try {
      const score = result.marks ?? result.scoreRaw ?? 0;
      const percentage = Number(result.percentage ?? 0);
      const questions = result.details ?? result.detailedResults ?? [];
      const topic = result.topic || "";

      const response = await api.post("/ai/ai-analysis", {
        score,
        percentage,
        questions,
        topic,
      });

      setAiAnalysis(
        response.data?.analysis || "No AI analysis was returned."
      );
    } catch (err) {
      console.error("AI analysis error:", err);

      if (err.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }

      if (err.response?.status === 403) {
        setAiError("You do not have permission to access AI analysis.");
        return;
      }

      setAiError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to generate AI Analysis. Please try again."
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading result...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RESULT ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Result Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/question")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition"
          >
            Go Question Page
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO RESULT
  // =====================================================

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Result Found
          </h2>
          <button
            type="button"
            onClick={() => navigate("/question")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition"
          >
            Go Question Page
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // RESULT DATA
  // =====================================================

  const score = result.marks ?? result.scoreRaw ?? 0;
  const reviewData = result.details ?? result.detailedResults ?? [];
  const percentage = Number(result.percentage ?? 0);
  const isGood = percentage >= 80;

  // =====================================================
  // SECTION STATS NORMALIZER  ← THE FIX
  // =====================================================

  const normalizeSectionStats = (raw) => {
    if (!raw) return [];

    // Plain object: { "Biomolecules": { correct, wrong, ... }, ... }
    if (!Array.isArray(raw) && typeof raw === "object") {
      return Object.entries(raw);
    }

    if (Array.isArray(raw)) {
      // API shape: [ { "Biomolecules": {...}, "Cell Structure...": {...} } ]
      if (
        raw.length === 1 &&
        typeof raw[0] === "object" &&
        raw[0] !== null &&
        !raw[0].section &&
        !raw[0].name &&
        !("correct" in raw[0])
      ) {
        return Object.entries(raw[0]);
      }

      // Array of section objects: [ { section: "Biomolecules", correct: 0, ... }, ... ]
      return raw.map((item, index) => {
        const name = item.section || item.name || `Section ${index + 1}`;
        return [name, item];
      });
    }

    return [];
  };

  const sectionEntries = normalizeSectionStats(result.sectionStats);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* RESULT CARD */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-center">
            <h2 className="text-2xl font-bold text-white">Result</h2>
          </div>

          <div className="p-6 sm:p-8 text-center space-y-3">
            <div className="space-y-1">
              <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
                {score}
              </p>
              <p className="text-lg text-gray-600">
                Percentage:{" "}
                <span className="font-semibold text-gray-800">
                  {percentage}%
                </span>
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isGood
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isGood ? (
                <>
                  <span>Good Job</span>
                  <span>🎉</span>
                </>
              ) : (
                <>
                  <span>Needs Improvement</span>
                  <span>❌</span>
                </>
              )}
            </div>

            {(result.topic || result.difficulty || result.examType) && (
              <div className="pt-2 text-sm text-gray-500">
                {result.examType && (
                  <span>
                    Exam:{" "}
                    <strong className="text-gray-700">
                      {result.examType}
                    </strong>
                  </span>
                )}
                {result.difficulty && (
                  <span className="ml-3">
                    Difficulty:{" "}
                    <strong className="text-gray-700 capitalize">
                      {result.difficulty}
                    </strong>
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/question")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition"
              >
                Go Question Page
              </button>

              <button
                type="button"
                onClick={handleAiAnalysis}
                disabled={isAiLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Get AI Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* AI ANALYSIS */}
        {(isAiLoading || aiAnalysis || aiError) && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🧠</span>
              AI Performance Insight
            </h3>

            {isAiLoading && (
              <div className="flex items-center gap-3 text-gray-600">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                AI is analyzing your performance...
              </div>
            )}

            {aiError && (
              <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                {aiError}
              </p>
            )}

            {aiAnalysis && (
              <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded-xl p-5 border border-gray-100">
                {aiAnalysis}
              </div>
            )}
          </div>
        )}

        {/* SECTION PERFORMANCE */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Section Performance
          </h3>

          {sectionEntries.length === 0 ? (
            <p className="text-sm text-gray-500">
              No section statistics available.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sectionEntries.map(([section, data]) => (
                <div
                  key={section}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition"
                >
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                    {section}
                  </h4>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Correct</span>
                      <span className="font-medium text-green-600">
                        {data.correct ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Wrong</span>
                      <span className="font-medium text-red-500">
                        {data.wrong ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Attempted</span>
                      <span className="font-medium text-gray-700">
                        {data.attempted ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Total</span>
                      <span className="font-medium text-gray-700">
                        {data.total ?? 0}
                      </span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-gray-500">Percentage</span>
                      <span className="font-bold text-blue-600">
                        {data.percentage ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ANSWER REVIEW */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Answer Review
          </h3>

          {reviewData.length === 0 ? (
            <p className="text-sm text-gray-500">
              No answer review data available.
            </p>
          ) : (
            <div className="space-y-5">
              {reviewData.map((q, index) => {
                const isCorrect = q.status === "correct";
                const isWrong = q.status === "wrong";
                const isUnattempted = q.status === "unattempted";

                return (
                  <div
                    key={q.id ?? index}
                    className={`rounded-xl p-5 border ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : isWrong
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 mb-3">
                      {q.id ?? index + 1}. {q.question}
                    </h4>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-500">Your Answer:</span>{" "}
                        <span className="font-medium text-gray-800">
                          {q.userAnswer || "Not Attempted"}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">Correct Answer:</span>{" "}
                        <span className="font-medium text-gray-800">
                          {q.answer}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3">
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                          ✅ Correct
                        </span>
                      )}
                      {isWrong && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">
                          ❌ Wrong
                        </span>
                      )}
                      {isUnattempted && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                          ⏭ Unattempted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}