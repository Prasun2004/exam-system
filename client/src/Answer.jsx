import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const stateResult = location.state?.result;
  const [result, setResult] = useState(stateResult || null);

  // AI Analysis states
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
  }, [id]);

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError("");
    setAiAnalysis("");

    try {
      const response = await axios.post("http://localhost:8080/ai-analysis", {
        score: result.marks || result.scoreRaw,
        percentage: result.percentage,
        questions: result.details ?? result.detailedResults ?? [],
        topic: result.topic,
      });

      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
      setAiError("Failed to generate AI Analysis. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Result Found</h2>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const score = result.marks || result.scoreRaw;
  const reviewData = result.details ?? result.detailedResults ?? [];
  const percentage = Number(result.percentage);
  const isGood = percentage >= 80;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ===== RESULT CARD ===== */}
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
                Percentage: <span className="font-semibold text-gray-800">{result.percentage}%</span>
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

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition"
              >
                Go Home
              </button>

              <button
                onClick={handleAiAnalysis}
                disabled={isAiLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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

        {/* ===== AI ANALYSIS SECTION ===== */}
        {(isAiLoading || aiAnalysis || aiError) && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🧠</span> AI Performance Insight
            </h3>

            {isAiLoading && (
              <div className="flex items-center gap-3 text-gray-600">
                <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI is crunching your score stats...
              </div>
            )}

            {aiError && (
              <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg">{aiError}</p>
            )}

            {aiAnalysis && (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line bg-gray-50 rounded-xl p-5 border border-gray-100">
                {aiAnalysis}
              </div>
            )}
          </div>
        )}

        {/* ===== SECTION PERFORMANCE ===== */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Section Performance</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(result.sectionStats || {}).map(([section, data]) => (
              <div
                key={section}
                className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition"
              >
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">{section}</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Correct</span>
                    <span className="font-medium text-green-600">{data.correct}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Wrong</span>
                    <span className="font-medium text-red-500">{data.wrong}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Attempted</span>
                    <span className="font-medium text-gray-700">{data.attempted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span className="font-medium text-gray-700">{data.total}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-500">Percentage</span>
                    <span className="font-bold text-blue-600">{data.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ANSWER REVIEW ===== */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Answer Review</h3>

          <div className="space-y-5">
            {reviewData.map((q) => {
              const isCorrect = q.status === "correct";
              const isWrong = q.status === "wrong";
              const isUnattempted = q.status === "unattempted";

              return (
                <div
                  key={q.id}
                  className={`rounded-xl p-5 border ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : isWrong
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h4 className="font-medium text-gray-900 mb-3">
                    {q.id}. {q.question}
                  </h4>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Your Answer: </span>
                      <span className="font-medium text-gray-800">
                        {q.userAnswer || "Not Attempted"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Correct Answer: </span>
                      <span className="font-medium text-gray-800">{q.answer}</span>
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
        </div>
      </div>
    </div>
  );
}