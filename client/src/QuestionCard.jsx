import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./componat/api";

export default function QuestionCard() {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All Topics");
  const [difficulty, setDifficulty] = useState("Difficulty");
  const [dateFilter, setDateFilter] = useState("Date");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Restriction state
  const [locked, setLocked] = useState(false);
  const [allowedExamIds, setAllowedExamIds] = useState([]);
  const [restrictionMessage, setRestrictionMessage] = useState("");

  const navigate = useNavigate();

  // ============================================
  // FETCH EXAMS + RESTRICTION
  // ============================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [examsRes, restrictRes] = await Promise.all([
          api.get("/result/exam-question"),
          api.get("/reminder/restricted-exam"),
        ]);

        if (examsRes.data?.success) {
          setExams(examsRes.data.exams || []);
        } else {
          setExams(examsRes.data || []);
        }

        const restrictData = restrictRes.data || {};

        if (restrictData.success && restrictData.locked) {
          const ids = (restrictData.examIds || []).map((id) =>
            String(id)
          );
          setLocked(true);
          setAllowedExamIds(ids);
          setRestrictionMessage(
            restrictData.message ||
              "You must clear previous failed exams before starting a new one."
          );
        } else {
          setLocked(false);
          setAllowedExamIds([]);
          setRestrictionMessage("");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load exams."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================
  // HELPER – is this exam allowed?
  // ============================================

  const isExamAllowed = (exam) => {
    if (!locked) return true;
    return allowedExamIds.includes(String(exam.id));
  };

  // ============================================
  // FILTER + SEARCH
  // ============================================

  const filteredExams = useMemo(() => {
    let result = [...exams];

    if (search.trim()) {
      const searchText = search.toLowerCase();

      result = result.filter((exam) =>
        [exam.name, exam.title, exam.type, exam.mode]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchText)
          )
      );
    }

    if (difficulty !== "Difficulty") {
      result = result.filter(
        (exam) =>
          exam.mode?.toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (topic !== "All Topics") {
      result = result.filter((exam) =>
        exam.title?.toLowerCase().includes(topic.toLowerCase())
      );
    }

    if (dateFilter === "Newest First") {
      result.reverse();
    }

    if (dateFilter === "Oldest First") {
      result.reverse();
    }

    return result;
  }, [exams, search, topic, difficulty, dateFilter]);

  // ============================================
  // START EXAM
  // ============================================

  const handleStartExam = (exam) => {
    if (!isExamAllowed(exam)) return;
    navigate(`/exam/${exam.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ============================================ */}
        {/* FILTERS */}
        {/* ============================================ */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option>All Topics</option>
              <option>Biology</option>
              <option>Math</option>
              <option>History</option>
              <option>Computer Science</option>
              <option>Clinical Biochemistry</option>
              <option>Microbiology</option>
              <option>Hematology</option>
              <option>General Knowledge</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option>Date</option>
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option>Difficulty</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search exams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <svg
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/leaderboard")}
              className="
                px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-indigo-600 to-purple-600
                hover:opacity-90 transition-opacity
              "
            >
              🏆 Leaderboard
            </button>

            <button
              type="button"
              onClick={() => navigate("/CreateTest")}
              className="
                px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-blue-600 to-cyan-500
                hover:opacity-90 transition-opacity
              "
            >
              🛠️ Create Test
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* RESTRICTION BANNER */}
        {/* ============================================ */}

        {locked && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="font-semibold">⚠️ Restricted Mode</div>
            <div className="mt-1">
              {restrictionMessage ||
                "You can only attempt the exams listed below that you previously scored below the threshold."}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* LOADING */}
        {/* ============================================ */}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* ============================================ */}
        {/* ERROR */}
        {/* ============================================ */}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

        {/* ============================================ */}
        {/* NO EXAMS */}
        {/* ============================================ */}

        {!loading && !error && filteredExams.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No exams found
            </h3>
            <p className="text-gray-500 mt-2">
              Try changing your filters or search.
            </p>
          </div>
        )}

        {/* ============================================ */}
        {/* EXAM CARDS */}
        {/* ============================================ */}

        {!loading && !error && filteredExams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
              const allowed = isExamAllowed(exam);

              return (
                <div
                  key={exam.id}
                  className={`
                    rounded-2xl border shadow-sm p-6 flex flex-col transition-all
                    ${
                      allowed
                        ? "bg-white border-gray-100 hover:shadow-md"
                        : "bg-gray-100 border-gray-200 opacity-60 grayscale cursor-not-allowed"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={exam.avatar}
                      alt={exam.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {exam.name}
                      </h3>
                      <p className="text-xs text-gray-400 uppercase">
                        {exam.type}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 font-medium mb-3 leading-snug">
                    {exam.title}
                  </p>

                  <div className="mb-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
                        ${
                          exam.mode === "easy"
                            ? "bg-green-100 text-green-700"
                            : exam.mode === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {exam.mode?.charAt(0).toUpperCase() +
                        exam.mode?.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {exam.questions} Qs
                    </span>

                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {exam.time} s
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartExam(exam)}
                    disabled={!allowed}
                    className={`
                      mt-auto w-full font-medium py-3 rounded-xl transition-colors
                      ${
                        allowed
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }
                    `}
                  >
                    {allowed ? "START EXAM" : "LOCKED"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}