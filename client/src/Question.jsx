import React, { useState, useEffect,useRef } from "react";
import "./style/Question.css";
import ExamSecurityWrapper from "./Security.jsx";

const questionsData = [
  {
    "id": 1,
    "section": "Hemopoiesis",
    "question": "Which organ is the primary site of hematopoiesis in adults?",
    "options": [
      "Liver",
      "Spleen",
      "Bone marrow",
      "Thymus"
    ],
    "answer": "Bone marrow"
  },
  {
    "id": 2,
    "section": "Hemopoiesis",
    "question": "During fetal life, hematopoiesis first occurs in:",
    "options": [
      "Bone marrow",
      "Liver",
      "Yolk sac",
      "Spleen"
    ],
    "answer": "Yolk sac"
  },
  {
    "id": 3,
    "section": "Hemopoiesis",
    "question": "Which stem cell gives rise to all blood cells?",
    "options": [
      "Myeloblast",
      "Hemocytoblast",
      "Lymphoblast",
      "Megakaryocyte"
    ],
    "answer": "Hemocytoblast"
  },
  {
    "id": 4,
    "section": "Erythropoiesis",
    "question": "Erythropoietin is mainly secreted by:",
    "options": [
      "Liver",
      "Kidney",
      "Bone marrow",
      "Spleen"
    ],
    "answer": "Kidney"
  },
  {
    "id": 5,
    "section": "Erythropoiesis",
    "question": "Reticulocyte is the immediate precursor of:",
    "options": [
      "Platelet",
      "Neutrophil",
      "Mature RBC",
      "Lymphocyte"
    ],
    "answer": "Mature RBC"
  },
  {
    "id": 6,
    "section": "Erythropoiesis",
    "question": "Which vitamin deficiency causes megaloblastic anemia?",
    "options": [
      "Vitamin C",
      "Vitamin D",
      "Vitamin B12",
      "Vitamin K"
    ],
    "answer": "Vitamin B12"
  },
  {
    "id": 7,
    "section": "Erythropoiesis",
    "question": "Average life span of RBC is:",
    "options": [
      "90 days",
      "100 days",
      "120 days",
      "150 days"
    ],
    "answer": "120 days"
  },
  {
    "id": 8,
    "section": "Leucopoiesis",
    "question": "Leucopoiesis refers to formation of:",
    "options": [
      "Platelets",
      "RBCs",
      "WBCs",
      "Plasma proteins"
    ],
    "answer": "WBCs"
  },
  {
    "id": 9,
    "section": "Leucopoiesis",
    "question": "Which leukocyte is most abundant in normal blood?",
    "options": [
      "Monocyte",
      "Basophil",
      "Neutrophil",
      "Eosinophil"
    ],
    "answer": "Neutrophil"
  },
  {
    "id": 10,
    "section": "Leucopoiesis",
    "question": "Agranulocytes include:",
    "options": [
      "Neutrophils",
      "Basophils",
      "Lymphocytes",
      "Eosinophils"
    ],
    "answer": "Lymphocytes"
  },
  {
    "id": 11,
    "section": "Thrombopoiesis",
    "question": "Platelets are formed from:",
    "options": [
      "Myelocytes",
      "Megakaryocytes",
      "Normoblasts",
      "Monocytes"
    ],
    "answer": "Megakaryocytes"
  },
  {
    "id": 12,
    "section": "Thrombopoiesis",
    "question": "Thrombopoietin is mainly produced by:",
    "options": [
      "Heart",
      "Kidney",
      "Liver",
      "Pancreas"
    ],
    "answer": "Liver"
  },
  {
    "id": 13,
    "section": "Thrombopoiesis",
    "question": "Normal platelet count is approximately:",
    "options": [
      "50,000–1 lakh/mm³",
      "1.5–4 lakh/mm³",
      "5–7 lakh/mm³",
      "8–10 lakh/mm³"
    ],
    "answer": "1.5–4 lakh/mm³"
  },
  {
    "id": 14,
    "section": "Hemopoiesis",
    "question": "Which of the following is NOT a myeloid cell?",
    "options": [
      "Neutrophil",
      "Eosinophil",
      "Lymphocyte",
      "Monocyte"
    ],
    "answer": "Lymphocyte"
  },
  {
    "id": 15,
    "section": "Erythropoiesis",
    "question": "Hemoglobin synthesis mainly requires:",
    "options": [
      "Calcium",
      "Iron",
      "Sodium",
      "Potassium"
    ],
    "answer": "Iron"
  },
  {
    "id": 16,
    "section": "Leucopoiesis",
    "question": "Which WBC is mainly responsible for allergic reactions?",
    "options": [
      "Neutrophil",
      "Basophil",
      "Monocyte",
      "Lymphocyte"
    ],
    "answer": "Basophil"
  },
  {
    "id": 17,
    "section": "Thrombopoiesis",
    "question": "Platelets mainly help in:",
    "options": [
      "Oxygen transport",
      "Immunity",
      "Blood clotting",
      "Hormone transport"
    ],
    "answer": "Blood clotting"
  },
  {
    "id": 18,
    "section": "Hemopoiesis",
    "question": "Adult red bone marrow is mainly present in:",
    "options": [
      "Femur shaft",
      "Skull and sternum",
      "Radius only",
      "Fibula only"
    ],
    "answer": "Skull and sternum"
  },
  {
    "id": 19,
    "section": "Erythropoiesis",
    "question": "Which condition stimulates erythropoietin secretion?",
    "options": [
      "Hyperoxia",
      "Hypoxia",
      "Hypertension",
      "Hyperglycemia"
    ],
    "answer": "Hypoxia"
  },
  {
    "id": 20,
    "section": "Leucopoiesis",
    "question": "Monocytes transform into which cells in tissues?",
    "options": [
      "Mast cells",
      "Macrophages",
      "Plasma cells",
      "Megakaryocytes"
    ],
    "answer": "Macrophages"
  },
  {
    "id": 21,
    "section": "Hemopoiesis",
    "question": "Extramedullary hematopoiesis commonly occurs in:",
    "options": [
      "Liver and spleen",
      "Heart and lungs",
      "Kidney and pancreas",
      "Brain and thymus"
    ],
    "answer": "Liver and spleen"
  },
  {
    "id": 22,
    "section": "Erythropoiesis",
    "question": "Normoblast loses its nucleus to become:",
    "options": [
      "Lymphocyte",
      "Reticulocyte",
      "Platelet",
      "Megakaryocyte"
    ],
    "answer": "Reticulocyte"
  },
  {
    "id": 23,
    "section": "Leucopoiesis",
    "question": "Which leukocyte has multilobed nucleus?",
    "options": [
      "Lymphocyte",
      "Monocyte",
      "Neutrophil",
      "Basophil"
    ],
    "answer": "Neutrophil"
  },
  {
    "id": 24,
    "section": "Thrombopoiesis",
    "question": "Life span of platelets is approximately:",
    "options": [
      "1–2 days",
      "3–5 days",
      "7–10 days",
      "15–20 days"
    ],
    "answer": "7–10 days"
  },
  {
    "id": 25,
    "section": "Hemopoiesis",
    "question": "Colony stimulating factors mainly stimulate:",
    "options": [
      "Platelet destruction",
      "WBC production",
      "Hemoglobin breakdown",
      "Clot dissolution"
    ],
    "answer": "WBC production"
  },
  {
    "id": 26,
    "section": "Erythropoiesis",
    "question": "Which hormone enhances erythropoiesis indirectly?",
    "options": [
      "Insulin",
      "Thyroxine",
      "Parathormone",
      "Calcitonin"
    ],
    "answer": "Thyroxine"
  },
  {
    "id": 27,
    "section": "Leucopoiesis",
    "question": "Which WBC is known as scavenger cell?",
    "options": [
      "Basophil",
      "Monocyte",
      "Neutrophil",
      "Eosinophil"
    ],
    "answer": "Monocyte"
  },
  {
    "id": 28,
    "section": "Thrombopoiesis",
    "question": "Platelet deficiency is called:",
    "options": [
      "Leukopenia",
      "Thrombocytopenia",
      "Polycythemia",
      "Neutropenia"
    ],
    "answer": "Thrombocytopenia"
  },
  {
    "id": 29,
    "section": "Hemopoiesis",
    "question": "Which factor is essential for DNA synthesis during blood cell formation?",
    "options": [
      "Vitamin B12",
      "Vitamin C",
      "Vitamin A",
      "Vitamin E"
    ],
    "answer": "Vitamin B12"
  },
  {
    "id": 30,
    "section": "Erythropoiesis",
    "question": "The normal RBC count in adults is approximately:",
    "options": [
      "1–2 million/mm³",
      "3–4 million/mm³",
      "4.5–5.5 million/mm³",
      "7–8 million/mm³"
    ],
    "answer": "4.5–5.5 million/mm³"
  },
  {
    "id": 31,
    "section": "Leucopoiesis",
    "question": "Which leukocyte increases during parasitic infection?",
    "options": [
      "Basophils",
      "Monocytes",
      "Eosinophils",
      "Neutrophils"
    ],
    "answer": "Eosinophils"
  },
  {
    "id": 32,
    "section": "Thrombopoiesis",
    "question": "Which organ removes old platelets?",
    "options": [
      "Heart",
      "Kidney",
      "Spleen",
      "Pancreas"
    ],
    "answer": "Spleen"
  },
  {
    "id": 33,
    "section": "Hemopoiesis",
    "question": "The pluripotent stem cell of blood is known as:",
    "options": [
      "Megakaryocyte",
      "Hemocytoblast",
      "Reticulocyte",
      "Normoblast"
    ],
    "answer": "Hemocytoblast"
  },
  {
    "id": 34,
    "section": "Erythropoiesis",
    "question": "Which mineral deficiency causes microcytic hypochromic anemia?",
    "options": [
      "Calcium",
      "Iron",
      "Magnesium",
      "Zinc"
    ],
    "answer": "Iron"
  },
  {
    "id": 35,
    "section": "Leucopoiesis",
    "question": "The normal WBC count is approximately:",
    "options": [
      "1,000–2,000/mm³",
      "4,000–11,000/mm³",
      "15,000–20,000/mm³",
      "25,000–30,000/mm³"
    ],
    "answer": "4,000–11,000/mm³"
  },
  {
    "id": 36,
    "section": "Thrombopoiesis",
    "question": "Platelets are fragments of:",
    "options": [
      "Erythrocytes",
      "Megakaryocytes",
      "Lymphocytes",
      "Neutrophils"
    ],
    "answer": "Megakaryocytes"
  },
  {
    "id": 37,
    "section": "Hemopoiesis",
    "question": "Red marrow converts to yellow marrow mainly due to:",
    "options": [
      "Fibrosis",
      "Fat deposition",
      "Calcification",
      "Hemorrhage"
    ],
    "answer": "Fat deposition"
  },
  {
    "id": 38,
    "section": "Erythropoiesis",
    "question": "Which stage of RBC maturation contains nucleus?",
    "options": [
      "Reticulocyte",
      "Mature RBC",
      "Normoblast",
      "Erythrocyte"
    ],
    "answer": "Normoblast"
  },
  {
    "id": 39,
    "section": "Leucopoiesis",
    "question": "Lymphocytes are mainly involved in:",
    "options": [
      "Blood clotting",
      "Oxygen transport",
      "Immunity",
      "Acid-base balance"
    ],
    "answer": "Immunity"
  },
  {
    "id": 40,
    "section": "Thrombopoiesis",
    "question": "Primary hemostasis mainly involves:",
    "options": [
      "RBC aggregation",
      "Platelet plug formation",
      "Hemoglobin synthesis",
      "Fibrin degradation"
    ],
    "answer": "Platelet plug formation"
  },

  // -------- 20% NON-TECH (10 Questions) --------

  {
    "id": 41,
    "section": "Coding-Decoding",
    "question": "If DOCTOR is coded as EPDUPS, then NURSE is coded as:",
    "options": [
      "OVSTF",
      "OVSFT",
      "OWSTF",
      "OVTTF"
    ],
    "answer": "OVSTF"
  },
  {
    "id": 42,
    "section": "Puzzle",
    "question": "Five friends sit in a row. A is left of B and right of C. D is right of B. Who sits in middle?",
    "options": [
      "A",
      "B",
      "C",
      "Cannot be determined"
    ],
    "answer": "A"
  },
  {
    "id": 43,
    "section": "Number Series",
    "question": "2, 6, 12, 20, 30, ?",
    "options": [
      "40",
      "41",
      "42",
      "44"
    ],
    "answer": "42"
  },
  {
    "id": 44,
    "section": "Odd One Out",
    "question": "Choose the odd one out.",
    "options": [
      "Neutrophil",
      "Basophil",
      "Platelet",
      "Eosinophil"
    ],
    "answer": "Platelet"
  },
  {
    "id": 45,
    "section": "Blood Relation",
    "question": "A is brother of B. B is sister of C. C is father of D. How is A related to D?",
    "options": [
      "Father",
      "Brother",
      "Uncle",
      "Grandfather"
    ],
    "answer": "Uncle"
  },
  {
    "id": 46,
    "section": "Direction",
    "question": "A man walks 10 m north, then 6 m east, then 10 m south. How far is he from starting point?",
    "options": [
      "4 m",
      "6 m",
      "8 m",
      "10 m"
    ],
    "answer": "6 m"
  },
  {
    "id": 47,
    "section": "Alphabet Series",
    "question": "A, C, F, J, O, ?",
    "options": [
      "T",
      "U",
      "V",
      "W"
    ],
    "answer": "U"
  },
  {
    "id": 48,
    "section": "Analogy",
    "question": "Heart : Circulation :: Lungs : ?",
    "options": [
      "Digestion",
      "Respiration",
      "Excretion",
      "Coordination"
    ],
    "answer": "Respiration"
  },
  {
    "id": 49,
    "section": "Statement & Conclusion",
    "question": "Statement: Some medicines are harmful. All harmful things should be avoided. Conclusion: Some medicines should be avoided.",
    "options": [
      "Follows",
      "Does not follow",
      "Partially follows",
      "None"
    ],
    "answer": "Follows"
  },
  {
    "id": 50,
    "section": "Ranking & Order",
    "question": "In a class of 40 students, Ravi ranks 12th from top. What is his rank from bottom?",
    "options": [
      "27th",
      "28th",
      "29th",
      "30th"
    ],
    "answer": "29th"
  }
];

export default function Question() {
  const totalTime =2400;

  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [topic, setTopic] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const[id,setId]=useState("");
  const [answerdata,setAnswerdata]=useState(null);

  const timerRef = useRef(null);
  const isSubmitting = useRef(false);

  // ✅ CONFIG
  const totalQuestions = questionsData.length;
  const totalSections = 5;
  const sectionSize = Math.ceil(totalQuestions / totalSections);
  const sectionTime = Math.floor(totalTime / totalSections);

  // ✅ CURRENT QUESTIONS
  const startIndex = currentSection * sectionSize;
  const endIndex = startIndex + sectionSize;
  const currentQuestions = questionsData.slice(startIndex, endIndex);

  // ✅ TIMER (ONLY COUNTDOWN — NO SECTION CHANGE)
  useEffect(() => {
    if (!started || submitted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    setTimeLeft(sectionTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentSection, started]);

  // ✅ HANDLE TIME = 0 (SAFE SECTION SWITCH)
  useEffect(() => {
    if (!started || submitted) return;
    if (timeLeft > 0) return;

    if (timerRef.current) clearInterval(timerRef.current);
      console.log(currentSection);
    if (currentSection < totalSections-1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [timeLeft]);

  // ✅ FORMAT TIME
  const formatTime = (time) => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ✅ SELECT ANSWER
  const handleSelect = (qid, option) => {
    setAnswers((prev) => ({
      ...prev,
        [qid]: prev[qid] === option ? "" : option,
    }));
    setStarted(true);
  };

  // ✅ NEXT SECTION BUTTON
  const handleNextSection = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentSection < totalSections - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  // ✅ RESULT CALCULATION
  const calculateResult = () => {
  let correct = 0;
  let wrong = 0;
  let attempted = 0;

  const sectionStats = {};

  const detailedResults = questionsData.map((q) => {
    const userAns = answers[q.id];

    if (!sectionStats[q.section]) {
      sectionStats[q.section] = {
        correct: 0,
        wrong: 0,
        attempted: 0,
        total: 0,
        percentage: 0   // 👈 add this
      };
    }

    sectionStats[q.section].total++;

    if (!userAns) {
      return { ...q, status: "unattempted", userAnswer: null };
    }

    attempted++;
    sectionStats[q.section].attempted++;

    if (userAns === q.answer) {
      correct++;
      sectionStats[q.section].correct++;
      return { ...q, status: "correct", userAnswer: userAns };
    } else {
      wrong++;
      sectionStats[q.section].wrong++;
      return { ...q, status: "wrong", userAnswer: userAns };
    }
  });

  // ✅ ADD THIS BLOCK (section percentage calculation)
  Object.keys(sectionStats).forEach((section) => {
    const sec = sectionStats[section];
    sec.percentage = ((sec.correct / sec.total) * 100).toFixed(2);
  });

  const unattempted = totalQuestions - attempted;
  const scoreRaw = correct - wrong / 4;
  const percentage = ((scoreRaw / totalQuestions) * 100).toFixed(2);

  return {
    correct,
    wrong,
    attempted,
    unattempted,
    scoreRaw,
    percentage,
    sectionStats,
    detailedResults,
  };
};

  // ✅ API CALL
  const sendToAPI = async (resultData) => {
    try {
      const res = await fetch("http://localhost:8080/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          marks: resultData.scoreRaw,
          percentage: resultData.percentage,
          details: resultData.detailedResults,
          sectionStats: resultData.sectionStats,
        }),
      });

      if (!res.ok) throw new Error();
      return true;
    } catch {
      return false;
    }
  };

  const getResult = async (id) => {
  const res = await fetch("http://localhost:8080/get-result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const data = await res.json();
  setAnswerdata(data.data);
  setStarted(true);
  setSubmitted(true);
  console.log(data);
};

  // ✅ SUBMIT (SAFE)
  const handleSubmit = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    const result = calculateResult();
    const success = await sendToAPI(result);

    if (success) {
      setSubmitted(true);
    } else {
      alert("Submission failed");
      isSubmitting.current = false;
    }
  };

  // ✅ START PAGE
  if (!started && !submitted) {
    return (
      <div className="start-container">
        <div className="start-card">
          <h2>Enter Topic</h2>

          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input"
          />

          <button
            disabled={!topic}
            onClick={() => setStarted(true)}
            className="submit-btn"
          >
            Start Test
          </button>
        </div>
         <div className="start-card">
          <h2>Enter ID</h2>

          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="input"
          />

          <button
            disabled={!id}
            onClick={() => getResult(id)}
            className="submit-btn"
          >
            Check
          </button>
        </div>
      </div>
    );
  }

  // ✅ RESULT PAGE (YOUR UI INCLUDED)
  // ✅ RESULT PAGE
if (submitted) {

  // 👇 API result OR live calculated result
  const result = answerdata || calculateResult();

  console.log(result.marks);

  // 👇 unified fields
  const score =
    result.marks || result.scoreRaw;

  const reviewData =
    result.details ?? result.detailedResults ?? [];

  return (
    <div className="result-container">

      {/* RESULT CARD */}
      <div className="result-card">
        <h2>Result</h2>

        <p>Score: {score}</p>

        <p>
          Percentage: {result.percentage}%
        </p>

        <p
          className={
            Number(result.percentage) >= 70
              ? "good"
              : "bad"
          }
        >
          {Number(result.percentage) >= 70
            ? "Good Job 🎉"
            : "Needs Improvement ❌"}
        </p>
      </div>

      {/* SECTION PERFORMANCE */}
      <div className="section-result">
        <h3>Section Performance</h3>

        {Object.entries(
          result.sectionStats || {}
        ).map(([section, data]) => (
          <div
            key={section}
            className="section-card"
          >
            <h4>{section}</h4>

            <p>Correct: {data.correct}</p>

            <p>Wrong: {data.wrong}</p>

            <p>
              Attempted: {data.attempted}
            </p>

            <p>Total: {data.total}</p>

            <p>
              Percentage: {data.percentage}%
            </p>
          </div>
        ))}
      </div>

      {/* ANSWER REVIEW */}
      <div className="review-section">
        <h3 style={{ color: "black" }}>
          Answer Review
        </h3>

        {reviewData.map((q) => (
          <div
            key={q.id}
            className={`review-card ${q.status}`}
          >
            <h4>
              {q.id}. {q.question}
            </h4>

            <p>
              <strong>Your Answer:</strong>{" "}
              {q.userAnswer || "Not Attempted"}
            </p>

            <p>
              <strong>Correct Answer:</strong>{" "}
              {q.answer}
            </p>

            <p className="status">
              {q.status === "correct" &&
                "✅ Correct"}

              {q.status === "wrong" &&
                "❌ Wrong"}

              {q.status ===
                "unattempted" &&
                "⏭ Unattempted"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

  // ✅ EXAM UI
  return (
    <ExamSecurityWrapper
      active={started && !submitted}
      onAutoSubmit={handleSubmit}
      maxViolations={1}
    >
      <div className="app-container">
        <div className="card">
          <div className="header">
            <p>{topic} Test</p>
            <h3>
              Section {currentSection + 1} / {totalSections}
            </h3>
            <div className="timer">⏱ {formatTime(timeLeft)}</div>
          </div>

          {currentQuestions.map((q) => (
            <div key={q.id} className="question">
              <h2>
                {q.id}. {q.question}
              </h2>

              {q.options.map((opt) => (
                <label key={opt} className="option">
                  <input
                    type="checkbox"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt}
                    onChange={() => handleSelect(q.id, opt)}
                   
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          <button onClick={handleNextSection} className="submit-btn">
            {currentSection === totalSections - 1
              ? "Submit Test"
              : "Next Section"}
          </button>
        </div>
      </div>
    </ExamSecurityWrapper>
  );
}