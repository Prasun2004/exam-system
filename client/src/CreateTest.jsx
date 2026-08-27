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

  // Basic settings
  const [examType, setExamType] = useState("CRE");
  const [totalTime, setTotalTime] = useState(2400);
  const [numQuestions, setNumQuestions] = useState(20);
  const [creationMode, setCreationMode] = useState("ai");
  const [manualJson, setManualJson] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Final grouped subjects that will be sent
  // Structure: [{ category, subject: "A, B", subTopics: [...] }]
  const [subjects, setSubjects] = useState([]);

  // Temporary selection
  const [category, setCategory] = useState("Technical");
  const [subject, setSubject] = useState(Object.keys(convertedSyllabus["Technical"])[0]);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);
  const [showSubTopics, setShowSubTopics] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSubTopics(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset subject when category changes
  useEffect(() => {
    const first = Object.keys(convertedSyllabus[category])[0];
    setSubject(first);
    setSelectedSubTopics([]);
  }, [category]);

  // Subtopic helpers
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

  const handleClearCurrent = () => setSelectedSubTopics([]);

  // ===== ADD SUBJECT (group by category) =====
  const addSubject = () => {
    if (selectedSubTopics.length === 0) {
      setError("Please select at least one sub-topic.");
      return;
    }

    setSubjects((prev) => {
      const existingIndex = prev.findIndex((s) => s.category === category);

      if (existingIndex >= 0) {
        // Category already exists → merge
        const existing = prev[existingIndex];
        const subjectNames = existing.subject.split(", ").filter(Boolean);

        // Add new subject name if not already present
        if (!subjectNames.includes(subject)) {
          subjectNames.push(subject);
        }

        // Merge subTopics (unique)
        const mergedSubTopics = Array.from(
          new Set([...existing.subTopics, ...selectedSubTopics])
        );

        const updated = [...prev];
        updated[existingIndex] = {
          category,
          subject: subjectNames.join(", "),
          subTopics: mergedSubTopics,
        };
        return updated;
      }

      // New category → create new group
      return [
        ...prev,
        {
          category,
          subject: subject,
          subTopics: [...selectedSubTopics],
        },
      ];
    });

    // Reset current selection
    setSelectedSubTopics([]);
    setError("");
  };

  const removeSubjectGroup = (index) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (creationMode === "manual") {
      try {
        const parsedQuestions = JSON.parse(manualJson);
        if (!Array.isArray(parsedQuestions)) throw new Error("Must be an array");

        navigate("/exam", {
          state: {
            totalTime,
            difficulty,
            examType,
            subjects,
            customQuestions: parsedQuestions,
          },
        });
      } catch (err) {
        setError("Invalid JSON format. Please ensure it is an array of question objects.");
        setIsLoading(false);
      }
      return;
    }

    // AI Mode
    if (subjects.length === 0) {
      setError("Please add at least one subject group.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        examType,
        difficulty,
        numQuestions,
        subjects, // ← grouped by Technical / Non-Technical
      };

      console.log("Final payload →", payload);

      const response = await axios.post(
        "http://localhost:8080/api/generate-questions",
        payload
      );

      navigate("/exam", {
        state: {
          totalTime,
          difficulty,
          examType,
          subjects,
          customQuestions: response.data.questions,
        },
      });
    } catch (err) {
      console.error(err);
      setError("AI Generation failed. Check backend connection.");
    } finally {
      setIsLoading(false);
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
            {/* Exam Type */}
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
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">CRE</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="examType"
                    value="RRB"
                    checked={examType === "RRB"}
                    onChange={() => setExamType("RRB")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">RRB</span>
                </label>
              </div>
            </div>

            {/* Add Subject Section */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Add Subjects (will be grouped by Technical / Non-Technical)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm"
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
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setSelectedSubTopics([]);
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm"
                  >
                    {Object.keys(convertedSyllabus[category]).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                {/* Sub Topics */}
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
                        ? "Click to select..."
                        : `${selectedSubTopics.length} selected`}
                    </span>
                    <span className="text-gray-400 text-xs">{showSubTopics ? "▲" : "▼"}</span>
                  </div>

                  {showSubTopics && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b">
                        <span className="text-sm font-semibold">{selectedSubTopics.length} selected</span>
                        <div className="flex gap-3">
                          <button type="button" onClick={handleSelectAllCurrent} className="text-xs text-blue-600">
                            Select All
                          </button>
                          <button type="button" onClick={handleClearCurrent} className="text-xs text-red-600">
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1">
                        {(convertedSyllabus[category][subject] || []).map((item) => (
                          <label key={item} className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={selectedSubTopics.includes(item)}
                              onChange={() => handleSubTopicChange(item)}
                              className="w-4 h-4 text-blue-600 rounded mr-3"
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Current chips */}
              {selectedSubTopics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedSubTopics.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-sky-100 text-sky-800 border border-sky-200">
                      {item}
                      <button type="button" onClick={() => removeSubTopic(item)} className="ml-1 font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={addSubject}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                >
                  ➕ Add / Merge into Category
                </button>
              </div>
            </div>

            {/* Final Grouped Subjects Preview */}
            {subjects.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-indigo-900">
                    Final Groups ({subjects.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSubjects([])}
                    className="text-xs font-medium text-red-600"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  {subjects.map((s, index) => (
                    <div key={index} className="bg-white rounded-xl border border-indigo-100 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {s.category}
                          </div>
                          <div className="text-sm text-indigo-700 mt-1">
                            Subjects: <span className="font-medium">{s.subject}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {s.subTopics.map((t) => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubjectGroup(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-lg"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time + Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Total Time (seconds)
                </label>
                <input
                  type="number"
                  value={totalTime}
                  onChange={(e) => setTotalTime(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Target Complexity Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm"
                >
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCreationMode("manual")}
                className={`py-3 rounded-xl font-semibold text-sm ${
                  creationMode === "manual" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                ✍️ Manual JSON Field
              </button>
              <button
                type="button"
                onClick={() => setCreationMode("ai")}
                className={`py-3 rounded-xl font-semibold text-sm ${
                  creationMode === "ai" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                ✨ Smart AI Generation
              </button>
            </div>

            {/* Conditional Area */}
            {creationMode === "manual" ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Paste Array Data (JSON format)
                </label>
                <textarea
                  rows={7}
                  value={manualJson}
                  onChange={(e) => setManualJson(e.target.value)}
                  placeholder={`[\n  {\n    "id": 1,\n    "section": "Microbiology",\n    "question": "Sample?",\n    "options": ["A","B","C","D"],\n    "answer": "A"\n  }\n]`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm resize-y"
                />
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  No. of Questions (Total)
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-purple-300 text-sm"
                />
              </div>
            )}

            {error && (
              <p className="text-red-600 font-medium text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-white text-base ${
                creationMode === "ai"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600"
                  : "bg-green-600"
              } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Assembling Your Test Workspace..." : "🚀 Launch Configured Test"}
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate("/leaderboard")}
          className="mt-5 w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          LeaderBoard
        </button>
      </div>
    </div>
  );
}