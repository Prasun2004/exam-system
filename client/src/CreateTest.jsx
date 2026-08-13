import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const syllabus = {
  tech: [
    {
      topic: "Clinical Biochemistry",
      subtopics: [
        "Biomolecules", "Enzymes", "Carbohydrate Metabolism", "Protein Metabolism",
        "Lipid Metabolism", "Water & Electrolyte Balance", "Acid-Base Balance",
        "Vitamins & Minerals", "Clinical Enzymology", "Cardiac Markers",
        "Liver Function Test (LFT)", "Renal Function Test (RFT)", "Endocrine Function Test",
        "Quality Control & Quality Assurance", "Laboratory Instruments"
      ]
    },
    {
      topic: "Hematology",
      subtopics: [
        "Structure & Function of Blood", "RBC Indices & ESR", "WBC & Differential Count",
        "Hemoglobinopathies", "Anemias", "Bleeding Disorders", "Coagulation & Anticoagulants",
        "Platelets & Platelet Disorders", "Bone Marrow Examination", "Blood Grouping & Rh Typing",
        "Cross Matching", "Transfusion Medicine", "Hematology Analyzers"
      ]
    },
    {
      topic: "Microbiology",
      subtopics: [
        "General Microbiology", "Bacteriology", "Culture Media", "Sterilization",
        "Biochemical Tests", "Immunology", "Serology", "Parasitology", "Mycology",
        "Mycobacteriology", "Virology", "Infection Control", "Biosafety",
        "Antimicrobial Susceptibility Testing (AST)"
      ]
    },
    {
      topic: "Clinical Pathology",
      subtopics: [
        "Urine Examination", "Stool Examination", "Semen Analysis", "Body Fluids",
        "Cerebrospinal Fluid (CSF)", "Synovial Fluid", "Pleural Fluid", "Ascitic Fluid",
        "Gastric Fluid", "Sputum Examination", "Routine & Special Investigations"
      ]
    },
    {
      topic: "Cytopathology & Histopathology",
      subtopics: [
        "Cell Structure & Function", "Cytological Techniques", "Staining Methods",
        "Fine Needle Aspiration Cytology (FNAC)", "Exfoliative Cytology",
        "Histopathological Techniques", "Tissue Processing", "Embedding & Sectioning",
        "Routine & Special Stains", "Immunohistochemistry"
      ]
    },
    {
      topic: "Immunohematology & Transfusion Medicine",
      subtopics: [
        "Blood Group Systems", "Antigen & Antibody", "Compatibility Testing",
        "Cross Matching", "Aplastic Anemia", "Hemolytic Disease", "Blood Components",
        "Blood Storage", "Transfusion Reactions"
      ]
    },
    {
      topic: "Molecular Biology & Biotechnology",
      subtopics: [
        "Structure of DNA & RNA", "DNA Replication", "Transcription", "Translation",
        "PCR & Applications", "Restriction Enzymes", "Gel Electrophoresis",
        "Blotting Techniques", "Recombinant DNA Technology", "ELISA",
        "Genetic Engineering", "DNA Fingerprinting"
      ]
    },
    {
      topic: "Laboratory Management",
      subtopics: [
        "Laboratory Organization", "Safety Measures", "Quality Control & Quality Assurance",
        "Laboratory Instruments & Maintenance", "Record Keeping",
        "Sample Collection & Handling", "Biomedical Waste Management"
      ]
    },
    {
      topic: "Anatomy, Physiology & Health Education",
      subtopics: [
        "Human Anatomy", "Human Physiology", "Blood Circulation", "Respiratory System",
        "Digestive System", "Endocrine System", "Reproductive System", "Nervous System",
        "Health Education", "Community Health"
      ]
    },
    {
      topic: "Instrumentation & Techniques",
      subtopics: [
        "Microscope & Types", "Centrifuge & Uses", "Colorimeter", "Spectrophotometer",
        "Hematology Analyzers", "Biochemistry Analyzers", "ELISA Reader", "PCR Machine",
        "pH Meter", "Other Laboratory Equipment"
      ]
    }
  ],
  nonTech: [
    {
      topic: "General Knowledge & Aptitude",
      subtopics: [
        "General Science", "Current Affairs", "Indian Polity", "Indian Geography",
        "Indian History", "General Awareness", "Logical Reasoning",
        "Quantitative Aptitude", "English Language"
      ]
    },
    {
      topic: "Computer Application in Laboratory",
      subtopics: [
        "MS Office (Word, Excel, PowerPoint)", "Laboratory Software",
        "Data Entry & Management", "Internet & Email", "Basic Computer Knowledge",
        "Information Technology in Laboratory"
      ]
    },
    {
      topic: "MATH",
      subtopics: [
        "Percentage", "Ratio & Proportion", "Time & Work", "Time, Speed & Distance",
        "Number System", "Profit & Loss", "Simple & Compound Interest", "Average",
        "Simplification", "Data Interpretation"
      ]
    },
    {
      topic: "REASONING",
      subtopics: [
        "Analogy", "Classification", "Series", "Coding-Decoding", "Blood Relations",
        "Direction Sense Test", "Ranking & Order", "Alphabet Test", "Number & Letter Series",
        "Odd One Out", "Syllogism", "Statement & Conclusion", "Statement & Assumption",
        "Statement & Argument", "Assertion & Reason", "Cause & Effect", "Venn Diagram",
        "Puzzle", "Seating Arrangement", "Logical Reasoning", "Non-Verbal Reasoning"
      ]
    },
    {
      topic: "ENGLISH",
      subtopics: [
        "Preposition", "Articles", "Tenses", "Active & Passive Voice",
        "Direct & Indirect Speech", "Modals", "Auxiliary Verbs", "Sentence Correction",
        "Error Detection", "Synonyms", "Antonyms", "One Word Substitution",
        "Idioms & Phrases", "Phrasal Verbs", "Spelling Correction", "Vocabulary",
        "Word Formation", "Confusing Words"
      ]
    }
  ]
};

const convertedSyllabus = {
  Technical: {},
  "Non-Technical": {}
};
syllabus.tech.forEach((item) => {
  convertedSyllabus.Technical[item.topic] = item.subtopics;
});
syllabus.nonTech.forEach((item) => {
  convertedSyllabus["Non-Technical"][item.topic] = item.subtopics;
});

export default function CreateTest() {
  const navigate = useNavigate();

  const [examType, setExamType] = useState("CRE");
  const [totalTime, setTotalTime] = useState(2400);
  const [numQuestions, setNumQuestions] = useState(20);
  const [creationMode, setCreationMode] = useState("manual");
  const [manualJson, setManualJson] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("Technical");
  const [subject, setSubject] = useState(Object.keys(convertedSyllabus["Technical"])[0]);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);
  const [showSubTopics, setShowSubTopics] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSubTopics(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubTopicChange = (item) => {
    setSelectedSubTopics((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  };

  const removeSubTopic = (item) => {
    setSelectedSubTopics((prev) => prev.filter((t) => t !== item));
  };

  const handleSelectAllCurrent = () => {
    const current = convertedSyllabus[category][subject] || [];
    setSelectedSubTopics((prev) => {
      const newOnes = current.filter((t) => !prev.includes(t));
      return [...prev, ...newOnes];
    });
  };

  const handleClearAll = () => {
    setSelectedSubTopics([]);
  };

  const buildTopicString = () => {
    if (selectedSubTopics.length === 0) {
      return `${category} - ${subject}`;
    }
    return `${category} | ${selectedSubTopics.join(" • ")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const topic = buildTopicString();

    if (creationMode === "manual") {
      try {
        const parsedQuestions = JSON.parse(manualJson);
        if (!Array.isArray(parsedQuestions)) throw new Error("Must be an array");
        navigate("/exam", {
          state: { topic, totalTime, difficulty, examType, customQuestions: parsedQuestions },
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
          examType,
          category,
          subject,
          subTopics: selectedSubTopics,
        });
        navigate("/exam", {
          state: {
            topic,
            totalTime,
            difficulty,
            examType,
            customQuestions: response.data.questions,
          },
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
    <div className="min-h-screen w-full bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">
            🛠️ Quiz Creator Studio
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ===== EXAM TYPE - RADIO BUTTONS ===== */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Exam</label>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="examType"
                    value="CRE"
                    checked={examType === "CRE"}
                    onChange={() => setExamType("CRE")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800">CRE</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="examType"
                    value="RRB"
                    checked={examType === "RRB"}
                    onChange={() => setExamType("RRB")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800">RRB</span>
                </label>
              </div>
            </div>

            {/* ===== CATEGORY + SUBJECT + SUBTOPICS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategory(val);
                    setSubject(Object.keys(convertedSyllabus[val])[0]);
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Technical">🖥️ Technical</option>
                  <option value="Non-Technical">📘 Non-Technical</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.keys(convertedSyllabus[category]).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Topics Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Select Sub Topics
                </label>

                <div
                  onClick={() => setShowSubTopics(!showSubTopics)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 bg-white cursor-pointer flex items-center justify-between"
                >
                  <span className="text-sm text-gray-500">
                    {selectedSubTopics.length === 0
                      ? "Click to select sub topics..."
                      : `${selectedSubTopics.length} sub topic(s) selected`}
                  </span>
                  <span className="text-gray-400 text-xs">{showSubTopics ? "▲" : "▼"}</span>
                </div>

                {showSubTopics && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b">
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedSubTopics.length} selected
                      </span>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleSelectAllCurrent}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Select All (this subject)
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {(convertedSyllabus[category][subject] || []).map((item) => (
                        <label
                          key={item}
                          className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubTopics.includes(item)}
                            onChange={() => handleSubTopicChange(item)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== SELECTED SUB TOPICS - SEPARATE PLACE ===== */}
            {selectedSubTopics.length > 0 && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-sky-800">
                    Selected Sub Topics ({selectedSubTopics.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedSubTopics.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-sky-100 text-sky-800 border border-sky-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeSubTopic(item)}
                        className="ml-1 text-sky-600 hover:text-red-600 font-bold text-base leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ===== TIME + DIFFICULTY ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Total Time (seconds)
                </label>
                <input
                  type="number"
                  value={totalTime}
                  onChange={(e) => setTotalTime(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Target Complexity Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>
            </div>

            {/* ===== MODE SWITCHER ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCreationMode("manual")}
                className={`py-3 rounded-xl font-semibold text-sm transition ${
                  creationMode === "manual"
                    ? "bg-green-600 text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ✍️ Manual JSON Field
              </button>
              <button
                type="button"
                onClick={() => setCreationMode("ai")}
                className={`py-3 rounded-xl font-semibold text-sm transition ${
                  creationMode === "ai"
                    ? "bg-purple-600 text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ✨ Smart AI Generation
              </button>
            </div>

            {/* ===== CONDITIONAL AREA ===== */}
            {creationMode === "manual" ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Paste Array Data (JSON format)
                </label>
                <textarea
                  rows={7}
                  value={manualJson}
                  onChange={(e) => setManualJson(e.target.value)}
                  placeholder={`[\n  {\n    "id": 1,\n    "section": "General",\n    "question": "Sample Question Text?",\n    "options": ["A", "B", "C", "D"],\n    "answer": "A"\n  }\n]`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                />
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  No. of Questions
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            )}

            {error && <p className="text-red-600 font-medium text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-white text-base transition ${
                creationMode === "ai"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Assembling Your Test Workspace..." : "🚀 Launch Configured Test"}
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate("/leaderboard")}
          className="mt-5 w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition"
        >
          LeaderBoard
        </button>
      </div>
    </div>
  );
}