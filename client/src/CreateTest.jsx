import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "./componat/api.js";

import { syllabus } from "./componat/syllabus";

// ======================================================
// CONVERT SYLLABUS
// ======================================================

const convertedSyllabus = {
  Technical: {},
  "Non-Technical": {},
};

syllabus.tech.forEach((item) => {
  convertedSyllabus.Technical[item.topic] =
    item.subtopics;
});

syllabus.nonTech.forEach((item) => {
  convertedSyllabus["Non-Technical"][item.topic] =
    item.subtopics;
});

// ======================================================
// CREATE TEST
// ======================================================

export default function CreateTest() {
  const navigate = useNavigate();

  // ====================================================
  // BASIC SETTINGS
  // ====================================================

  const [examType, setExamType] = useState("CRE");

  const [totalTime, setTotalTime] = useState(2400);

  const [numQuestions, setNumQuestions] = useState(20);

  const [creationMode, setCreationMode] =
    useState("ai");

  const [manualJson, setManualJson] = useState("");

  const [difficulty, setDifficulty] =
    useState("medium");

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  // ====================================================
  // CURRENT USER
  // ====================================================

  const [user, setUser] = useState(null);

  // ====================================================
  // SUBJECTS
  // ====================================================

  const [subjects, setSubjects] = useState([]);

  const [category, setCategory] =
    useState("Technical");

  const [subject, setSubject] = useState(
    Object.keys(
      convertedSyllabus.Technical
    )[0] || ""
  );

  const [selectedSubTopics, setSelectedSubTopics] =
    useState([]);

  const [showSubTopics, setShowSubTopics] =
    useState(false);

  const dropdownRef = useRef(null);

  // ====================================================
  // AUTH USER
  // ====================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response =
          await api.get("/auth/me");

        if (
          response.data?.success &&
          response.data?.user
        ) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );

        if (
          error.response?.status === 401
        ) {
          navigate("/", {
            replace: true,
          });
        }
      }
    };

    loadUser();
  }, [navigate]);

  // ====================================================
  // CLOSE DROPDOWN OUTSIDE CLICK
  // ====================================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowSubTopics(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ====================================================
  // CATEGORY CHANGE
  // ====================================================

  useEffect(() => {
    const categorySubjects =
      convertedSyllabus[category] || {};

    const first =
      Object.keys(categorySubjects)[0];

    setSubject(first || "");

    setSelectedSubTopics([]);
  }, [category]);

  // ====================================================
  // SUBTOPIC SELECT
  // ====================================================

  const handleSubTopicChange = (item) => {
    setSelectedSubTopics((prev) =>
      prev.includes(item)
        ? prev.filter((t) => t !== item)
        : [...prev, item]
    );

    setError("");
  };

  // ====================================================
  // REMOVE SUBTOPIC
  // ====================================================

  const removeSubTopic = (item) => {
    setSelectedSubTopics((prev) =>
      prev.filter((t) => t !== item)
    );
  };

  // ====================================================
  // SELECT ALL
  // ====================================================

  const handleSelectAllCurrent = () => {
    const current =
      convertedSyllabus[category]?.[subject] || [];

    setSelectedSubTopics((prev) => {
      const newOnes = current.filter(
        (t) => !prev.includes(t)
      );

      return [...prev, ...newOnes];
    });

    setError("");
  };

  // ====================================================
  // CLEAR
  // ====================================================

  const handleClearCurrent = () => {
    setSelectedSubTopics([]);

    setError("");
  };

  // ====================================================
  // ADD SUBJECT
  // ====================================================

  const addSubject = () => {
    if (selectedSubTopics.length === 0) {
      setError(
        "Please select at least one sub-topic."
      );

      return;
    }

    setSubjects((prev) => {
      const existingIndex =
        prev.findIndex(
          (s) => s.category === category
        );

      // Existing category
      if (existingIndex >= 0) {
        const existing =
          prev[existingIndex];

        const subjectNames =
          existing.subject
            .split(", ")
            .filter(Boolean);

        if (
          !subjectNames.includes(subject)
        ) {
          subjectNames.push(subject);
        }

        const mergedSubTopics =
          Array.from(
            new Set([
              ...existing.subTopics,
              ...selectedSubTopics,
            ])
          );

        const updated = [...prev];

        updated[existingIndex] = {
          category,
          subject:
            subjectNames.join(", "),
          subTopics: mergedSubTopics,
        };

        return updated;
      }

      // New category
      return [
        ...prev,
        {
          category,
          subject,
          subTopics: [
            ...selectedSubTopics,
          ],
        },
      ];
    });

    setSelectedSubTopics([]);

    setShowSubTopics(false);

    setError("");
  };

  // ====================================================
  // REMOVE SUBJECT GROUP
  // ====================================================

  const removeSubjectGroup = (index) => {
    setSubjects((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ====================================================
  // BUILD TOPIC STRING
  // ====================================================

  const buildTopicString = (subjectsArr) => {
    const allSubs =
      subjectsArr.flatMap(
        (s) => s.subTopics || []
      );

    return Array.from(
      new Set(allSubs)
    ).join(", ");
  };

  // ====================================================
  // SUBMIT / CREATE TEST
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    setError("");

    // ==================================================
    // MANUAL MODE
    // ==================================================

    if (creationMode === "manual") {
      try {
        if (!manualJson.trim()) {
          throw new Error(
            "Manual JSON is empty"
          );
        }

        const parsedQuestions =
          JSON.parse(manualJson);

        if (!Array.isArray(parsedQuestions)) {
          throw new Error(
            "Manual JSON must be an array"
          );
        }

        if (
          parsedQuestions.length === 0
        ) {
          throw new Error(
            "At least one question is required"
          );
        }

        navigate("/exam", {
          state: {
            totalTime,
            difficulty,
            examType,
            subjects,
            customQuestions:
              parsedQuestions,
          },
        });
      } catch (error) {
        console.error(
          "Manual JSON error:",
          error
        );

        setError(
          "Invalid JSON format. Please ensure it is an array of question objects."
        );

        setIsLoading(false);
      }

      return;
    }

    // ==================================================
    // AI MODE
    // ==================================================

    if (subjects.length === 0) {
      setError(
        "Please add at least one subject group."
      );

      setIsLoading(false);

      return;
    }

    // ==================================================
    // VALIDATE AI VALUES
    // ==================================================

    if (
      !numQuestions ||
      numQuestions < 5 ||
      numQuestions > 100
    ) {
      setError(
        "Number of questions must be between 5 and 100."
      );

      setIsLoading(false);

      return;
    }

    if (
      !totalTime ||
      totalTime < 60
    ) {
      setError(
        "Total time must be at least 60 seconds."
      );

      setIsLoading(false);

      return;
    }

    try {
      // =================================================
      // AI GENERATION PAYLOAD
      // =================================================

      const payload = {
        subjects: subjects,
        numQuestions: Number(numQuestions),
        difficulty: difficulty,
        examType: examType,
        totalTime: Number(totalTime),
      };

      console.log(
        "AI Generation Payload:",
        payload
      );

      console.log(
        "Topic string:",
        buildTopicString(subjects)
      );

      // =================================================
      // JWT IS AUTOMATICALLY ADDED BY api.js
      // =================================================

      const response =
        await api.post(
          "/ai/generate-questions",
          payload
        );

      // =================================================
      // CHECK RESPONSE
      // =================================================

      if (
        !response.data?.questions ||
        !Array.isArray(
          response.data.questions
        )
      ) {
        throw new Error(
          "Invalid questions response"
        );
      }

      // =================================================
      // GO TO EXAM PAGE
      // =================================================

      navigate("/question");
    } catch (error) {
      console.error(
        "AI Generation Error:",
        error
      );

      // ================================================
      // NOT LOGGED IN / TOKEN INVALID
      // ================================================

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/", {
          replace: true,
        });

        return;
      }

      // ================================================
      // NOT TEACHER
      // ================================================

      if (
        error.response?.status === 403
      ) {
        setError(
          "You do not have permission to generate tests. Please login with a teacher account."
        );

        return;
      }

      // ================================================
      // OTHER ERROR
      // ================================================

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "AI Generation failed. Check backend connection.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================================
  // VISIBLE SUBTOPICS
  // ====================================================

  const getVisibleSubTopics = () => {
    return (
      convertedSyllabus[category]?.[subject] || []
    );
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen w-full bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">

          {/* ==========================================
              HEADER
          ========================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                🛠️ Quiz Creator Studio
              </h1>

              {user && (
                <p className="text-sm text-gray-500 mt-2">
                  Logged in as{" "}
                  <span className="font-semibold text-gray-700">
                    {user.email}
                  </span>

                  {" · "}

                  <span className="capitalize text-blue-600 font-semibold">
                    {user.role}
                  </span>
                </p>
              )}
            </div>
            
            <button
              type="button"
              onClick={() =>
                navigate("/question")
              }
              className="
                px-5
                py-2.5
                rounded-xl
                font-semibold
                text-white
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                hover:opacity-90
              "
            >
              Question Page
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/leaderboard")
              }
              className="
                px-5
                py-2.5
                rounded-xl
                font-semibold
                text-white
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                hover:opacity-90
              "
            >
              LeaderBoard
            </button>
          </div>

          {/* ==========================================
              MAIN FORM
          ========================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ========================================
                EXAM TYPE
            ======================================== */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Exam
              </label>

              <div className="flex items-center gap-8">

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="examType"
                    value="CRE"
                    checked={
                      examType === "CRE"
                    }
                    onChange={() =>
                      setExamType("CRE")
                    }
                    className="w-4 h-4 text-blue-600"
                  />

                  <span className="text-sm font-medium">
                    CRE
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="examType"
                    value="RRB"
                    checked={
                      examType === "RRB"
                    }
                    onChange={() =>
                      setExamType("RRB")
                    }
                    className="w-4 h-4 text-blue-600"
                  />

                  <span className="text-sm font-medium">
                    RRB
                  </span>
                </label>

              </div>
            </div>

            {/* ========================================
                ADD SUBJECT
            ======================================== */}

            <div
              className="
                border
                border-gray-200
                rounded-2xl
                p-5
                bg-gray-50
              "
            >
              <h2
                className="
                  text-lg
                  font-semibold
                  text-gray-800
                  mb-4
                "
              >
                Add Subjects
              </h2>

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-5
                "
              >

                {/* CATEGORY */}

                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                      mb-1.5
                    "
                  >
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(
                        e.target.value
                      );
                    }}
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      text-sm
                    "
                  >
                    <option value="Technical">
                      🖥️ Technical
                    </option>

                    <option value="Non-Technical">
                      📘 Non-Technical
                    </option>
                  </select>
                </div>

                {/* SUBJECT */}

                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                      mb-1.5
                    "
                  >
                    Subject
                  </label>

                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(
                        e.target.value
                      );

                      setSelectedSubTopics(
                        []
                      );
                    }}
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      text-sm
                    "
                  >
                    {Object.keys(
                      convertedSyllabus[
                        category
                      ] || {}
                    ).map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SUBTOPICS */}

                <div
                  className="relative"
                  ref={dropdownRef}
                >
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                      mb-1.5
                    "
                  >
                    Select Sub Topics
                  </label>

                  <div
                    onClick={() =>
                      setShowSubTopics(
                        (prev) => !prev
                      )
                    }
                    className="
                      w-full
                      min-h-[44px]
                      px-3
                      py-2
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      cursor-pointer
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span className="text-sm text-gray-500">
                      {selectedSubTopics.length ===
                      0
                        ? "Click to select..."
                        : `${selectedSubTopics.length} selected`}
                    </span>

                    <span className="text-gray-400 text-xs">
                      {showSubTopics
                        ? "▲"
                        : "▼"}
                    </span>
                  </div>

                  {showSubTopics && (
                    <div
                      className="
                        absolute
                        z-50
                        mt-2
                        w-full
                        bg-white
                        border
                        border-gray-200
                        rounded-xl
                        shadow-xl
                        overflow-hidden
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          px-4
                          py-2.5
                          bg-gray-50
                          border-b
                        "
                      >
                        <span className="text-sm font-semibold">
                          {selectedSubTopics.length}{" "}
                          selected
                        </span>

                        <div className="flex gap-3">

                          <button
                            type="button"
                            onClick={
                              handleSelectAllCurrent
                            }
                            className="
                              text-xs
                              text-blue-600
                              hover:underline
                            "
                          >
                            Select All
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleClearCurrent
                            }
                            className="
                              text-xs
                              text-red-600
                              hover:underline
                            "
                          >
                            Clear
                          </button>

                        </div>
                      </div>

                      <div
                        className="
                          max-h-64
                          overflow-y-auto
                          py-1
                        "
                      >
                        {getVisibleSubTopics()
                          .length === 0 ? (
                          <p
                            className="
                              px-4
                              py-3
                              text-sm
                              text-gray-500
                            "
                          >
                            No sub-topics in
                            this subject.
                          </p>
                        ) : (
                          getVisibleSubTopics().map(
                            (item) => (
                              <label
                                key={item}
                                className="
                                  flex
                                  items-center
                                  px-4
                                  py-2.5
                                  hover:bg-gray-50
                                  cursor-pointer
                                  text-sm
                                "
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSubTopics.includes(
                                    item
                                  )}
                                  onChange={() =>
                                    handleSubTopicChange(
                                      item
                                    )
                                  }
                                  className="
                                    w-4
                                    h-4
                                    text-blue-600
                                    rounded
                                    mr-3
                                  "
                                />

                                {item}
                              </label>
                            )
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SELECTED CHIPS */}

              {selectedSubTopics.length >
                0 && (
                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {selectedSubTopics.map(
                    (item) => (
                      <span
                        key={item}
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-3
                          py-1.5
                          rounded-full
                          text-sm
                          bg-sky-100
                          text-sky-800
                          border
                          border-sky-200
                        "
                      >
                        {item}

                        <button
                          type="button"
                          onClick={() =>
                            removeSubTopic(
                              item
                            )
                          }
                          className="
                            ml-1
                            font-bold
                            hover:text-red-600
                          "
                        >
                          ×
                        </button>
                      </span>
                    )
                  )}
                </div>
              )}

              {/* ADD */}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={addSubject}
                  className="
                    px-6
                    py-2.5
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    font-semibold
                    text-sm
                  "
                >
                  ➕ Add / Merge into Category
                </button>
              </div>
            </div>

            {/* ========================================
                FINAL SUBJECT GROUPS
            ======================================== */}

            {subjects.length > 0 && (
              <div
                className="
                  bg-indigo-50
                  border
                  border-indigo-200
                  rounded-2xl
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-4
                  "
                >
                  <h3
                    className="
                      text-base
                      font-semibold
                      text-indigo-900
                    "
                  >
                    Final Groups ({subjects.length})
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setSubjects([])
                    }
                    className="
                      text-xs
                      font-medium
                      text-red-600
                      hover:underline
                    "
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  {subjects.map(
                    (group, index) => (
                      <div
                        key={`${group.category}-${index}`}
                        className="
                          bg-white
                          rounded-xl
                          border
                          border-indigo-100
                          p-4
                        "
                      >
                        <div
                          className="
                            flex
                            justify-between
                            items-start
                            gap-4
                          "
                        >
                          <div>
                            <div
                              className="
                                font-semibold
                                text-gray-800
                              "
                            >
                              {group.category}
                            </div>

                            <div
                              className="
                                text-sm
                                text-indigo-700
                                mt-1
                              "
                            >
                              Subjects:{" "}
                              <span className="font-medium">
                                {group.subject}
                              </span>
                            </div>

                            <div
                              className="
                                mt-2
                                flex
                                flex-wrap
                                gap-1.5
                              "
                            >
                              {group.subTopics.map(
                                (topic) => (
                                  <span
                                    key={topic}
                                    className="
                                      text-xs
                                      px-2
                                      py-0.5
                                      rounded-full
                                      bg-indigo-100
                                      text-indigo-700
                                    "
                                  >
                                    {topic}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeSubjectGroup(
                                index
                              )
                            }
                            className="
                              text-red-500
                              hover:text-red-700
                              font-bold
                              text-lg
                            "
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* ========================================
                TIME + DIFFICULTY
            ======================================== */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-5
              "
            >

              {/* TIME */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    mb-1.5
                  "
                >
                  Total Time (seconds)
                </label>

                <input
                  type="number"
                  min="60"
                  value={totalTime}
                  onChange={(e) =>
                    setTotalTime(
                      Number(e.target.value)
                    )
                  }
                  className="
                    w-full
                    h-11
                    px-3
                    rounded-xl
                    border
                    border-gray-300
                    text-sm
                  "
                />

                <p className="text-xs text-gray-500 mt-1">
                  Example: 2400 = 40 minutes
                </p>
              </div>

              {/* DIFFICULTY */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    mb-1.5
                  "
                >
                  Target Complexity Level
                </label>

                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    h-11
                    px-3
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    text-sm
                  "
                >
                  <option value="easy">
                    🟢 Easy
                  </option>

                  <option value="medium">
                    🟡 Medium
                  </option>

                  <option value="hard">
                    🔴 Hard
                  </option>
                </select>
              </div>
            </div>

            {/* ========================================
                MODE SWITCHER
            ======================================== */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              "
            >
              <button
                type="button"
                onClick={() =>
                  setCreationMode("manual")
                }
                className={`
                  py-3
                  rounded-xl
                  font-semibold
                  text-sm
                  ${
                    creationMode === "manual"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }
                `}
              >
                ✍️ Manual JSON Field
              </button>

              <button
                type="button"
                onClick={() =>
                  setCreationMode("ai")
                }
                className={`
                  py-3
                  rounded-xl
                  font-semibold
                  text-sm
                  ${
                    creationMode === "ai"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }
                `}
              >
                ✨ Smart AI Generation
              </button>
            </div>

            {/* ========================================
                CONDITIONAL MODE
            ======================================== */}

            {creationMode === "manual" ? (
              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    mb-1.5
                  "
                >
                  Paste Array Data (JSON format)
                </label>

                <textarea
                  rows={8}
                  value={manualJson}
                  onChange={(e) =>
                    setManualJson(
                      e.target.value
                    )
                  }
                  placeholder={`[
  {
    "id": 1,
    "section": "Microbiology",
    "question": "Sample question?",
    "options": [
      "A",
      "B",
      "C",
      "D"
    ],
    "answer": "A"
  }
]`}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    font-mono
                    text-sm
                    resize-y
                    outline-none
                    focus:border-blue-500
                    focus:ring-1
                    focus:ring-blue-500
                  "
                />
              </div>
            ) : (
              <div
                className="
                  bg-purple-50
                  border
                  border-purple-200
                  rounded-xl
                  p-5
                "
              >
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    mb-1.5
                  "
                >
                  No. of Questions (Total)
                </label>

                <input
                  type="number"
                  min={5}
                  max={100}
                  value={numQuestions}
                  onChange={(e) =>
                    setNumQuestions(
                      Number(e.target.value)
                    )
                  }
                  className="
                    w-full
                    h-11
                    px-3
                    rounded-xl
                    border
                    border-purple-300
                    text-sm
                  "
                />

                <p className="text-xs text-gray-500 mt-2">
                  AI will generate exactly this
                  number of questions.
                </p>
              </div>
            )}

            {/* ========================================
                REQUEST PREVIEW
            ======================================== */}

            {creationMode === "ai" &&
              subjects.length > 0 && (
                <div
                  className="
                    rounded-xl
                    border
                    border-blue-200
                    bg-blue-50
                    p-4
                  "
                >
                  <h3 className="font-semibold text-blue-900 mb-2">
                    AI Generation Settings
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">

                    <div>
                      <span className="text-gray-500">
                        Questions
                      </span>

                      <p className="font-semibold">
                        {numQuestions}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Difficulty
                      </span>

                      <p className="font-semibold capitalize">
                        {difficulty}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Exam
                      </span>

                      <p className="font-semibold">
                        {examType}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Time
                      </span>

                      <p className="font-semibold">
                        {totalTime}s
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Groups
                      </span>

                      <p className="font-semibold">
                        {subjects.length}
                      </p>
                    </div>

                  </div>
                </div>
              )}

            {/* ========================================
                ERROR
            ======================================== */}

            {error && (
              <p
                className="
                  text-red-600
                  font-medium
                  text-sm
                  bg-red-50
                  border
                  border-red-200
                  rounded-lg
                  px-4
                  py-3
                "
              >
                {error}
              </p>
            )}

            {/* ========================================
                SUBMIT
            ======================================== */}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full
                py-3.5
                rounded-xl
                font-bold
                text-white
                text-base

                ${
                  creationMode === "ai"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }

                ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }
              `}
            >
              {isLoading
                ? creationMode === "ai"
                  ? "🤖 AI is Generating Questions..."
                  : "Assembling Your Test Workspace..."
                : creationMode === "ai"
                ? "🚀 Generate AI Test"
                : "🚀 Launch Configured Test"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}