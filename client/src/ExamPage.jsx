import React, {
  useState,
  useEffect,
  useRef
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./style/Question.css";
import questionsData from "./componat/Question.js";

import {
  calculateResult,
} from "./componat/Calculator.js";
import ExamSecurityWrapper from "./Security.jsx";

export default function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const topic =
    location.state?.topic || "";

  const totalTime = 960;

  const totalQuestions =
    questionsData.length;

  const totalSections = 5;

  const sectionSize = Math.ceil(
    totalQuestions / totalSections
  );

  const sectionTime = Math.floor(
    totalTime / totalSections
  );

  const [answers, setAnswers] =
    useState({});

  const [currentSection,
    setCurrentSection] =
    useState(0);

  const [currentQuestionIndex,
    setCurrentQuestionIndex] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(sectionTime);

  const timerRef = useRef(null);

  const isSubmitting =
    useRef(false);

  const startIndex =
    currentSection * sectionSize;

  const endIndex =
    startIndex + sectionSize;

  const sectionQuestions =
    questionsData.slice(
      startIndex,
      endIndex
    );

  const currentQuestion =
    sectionQuestions[
      currentQuestionIndex
    ];

  useEffect(() => {
    if (timerRef.current)
      clearInterval(
        timerRef.current
      );

    setTimeLeft(sectionTime);
    setCurrentQuestionIndex(0);

    timerRef.current =
      setInterval(() => {
        setTimeLeft(
          (prev) => prev - 1
        );
      }, 1000);

    return () =>
      clearInterval(
        timerRef.current
      );
  }, [currentSection]);

  useEffect(() => {
    if (timeLeft > 0) return;

    if (timerRef.current)
      clearInterval(
        timerRef.current
      );

    if (
      currentSection <
      totalSections - 1
    ) {
      setCurrentSection(
        (prev) => prev + 1
      );
    } else {
      handleSubmit();
    }
  }, [timeLeft]);

  const formatTime = (
    time
  ) => {
    const m = Math.floor(
      time / 60
    );

    const s = time % 60;

    return `${m}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSelect = (
    qid,
    option
  ) => {
    setAnswers((prev) => ({
      ...prev,

      [qid]:
        prev[qid] === option
          ? ""
          : option,
    }));
  };

  const handlePrevQuestion =
    () => {
      if (
        currentQuestionIndex >
        0
      ) {
        setCurrentQuestionIndex(
          (prev) => prev - 1
        );
      }
    };

  // const handleNextQuestion =
  //   () => {
  //     if (
  //       currentQuestionIndex <
  //       sectionQuestions.length -
  //         1
  //     ) {
  //       setCurrentQuestionIndex(
  //         (prev) => prev + 1
  //       );

  //       return;
  //     }

  //     if (
  //       currentSection <
  //       totalSections - 1
  //     ) {
  //       setCurrentSection(
  //         (prev) => prev + 1
  //       );
  //     } else {
  //       handleSubmit();
  //     }
  //   };

  const handleNextQuestion = () => {
  if (
    currentQuestionIndex <
    sectionQuestions.length - 1
  ) {
    setCurrentQuestionIndex(
      (prev) => prev + 1
    );
  }
};

  const handleNextSection =
    () => {
      if (timerRef.current)
        clearInterval(
          timerRef.current
        );

      if (
        currentSection <
        totalSections - 1
      ) {
        setCurrentSection(
          (prev) => prev + 1
        );
      } else {
        handleSubmit();
      }
    };

  const sendToAPI =
    async (resultData) => {
      try {
        const res =
          await fetch(
            "http://localhost:8080/submit",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                topic,

                marks:
                  resultData.scoreRaw,

                percentage:
                  resultData.percentage,

                details:
                  resultData.detailedResults,

                sectionStats:
                  resultData.sectionStats,
              }),
            }
          );

        if (!res.ok)
          throw new Error();

        const data =
          await res.json();

        return data;
      } catch {
        return null;
      }
    };

  const handleSubmit =
    async () => {
      if (
        isSubmitting.current
      )
        return;

      isSubmitting.current =
        true;

      const result =
        calculateResult(
          questionsData,
          answers
        );

      const apiData =
        await sendToAPI(
          result
        );

      if (apiData) {
        navigate(
          "/result",
          {
            state: {
              result: {
                ...result,
                ...apiData,
              },
            },
          }
        );
      } else {
        alert(
          "Submission Failed"
        );

        isSubmitting.current =
          false;
      }
    };

  if (!currentQuestion)
    return null;

  return (
    <ExamSecurityWrapper
      active={topic}
      onAutoSubmit={
        handleSubmit
      }
      maxViolations={1}
    >
      <div className="app-container">
        <div className="card">

          <div className="header">

            <div>
              <p>
                {topic} Test
              </p>

              <h3>
                Section{" "}
                {currentSection +
                  1}
                {" / "}
                {totalSections}
              </h3>

              <div className="timer">
                ⏱{" "}
                {formatTime(
                  timeLeft
                )}
              </div>
            </div>

            <button
              className="section-btn"
              onClick={
                handleNextSection
              }
            >
              {currentSection ===
              totalSections - 1
                ? "Submit Test"
                : "Next Section"}
            </button>

          </div>

          <div className="question">

            <h2>
              {
                currentQuestion.id
              }
              .{" "}
              {
                currentQuestion.question
              }
            </h2>

            {currentQuestion.options.map(
              (opt) => (
                <label
                  key={opt}
                  className="option"
                >
                  <input
                    type="checkbox"
                    checked={
                      answers[
                        currentQuestion
                          .id
                      ] === opt
                    }
                    onChange={() =>
                      handleSelect(
                        currentQuestion.id,
                        opt
                      )
                    }
                  />

                  {opt}
                </label>
              )
            )}
          </div>

          <div className="question-nav">

            <button
              className="nav-btn"
              onClick={
                handlePrevQuestion
              }
              disabled={
                currentQuestionIndex ===
                0
              }
            >
              Previous
            </button>

            <span className="question-count">
              Question{" "}
              {currentQuestionIndex +
                1}
              {" / "}
              {
                sectionQuestions.length
              }
            </span>

             <button
  className="nav-btn"
  onClick={handleNextQuestion}
  disabled={
    currentQuestionIndex ===
    sectionQuestions.length - 1
  }
>
  Next
</button>

          </div>

        </div>
      </div>
    </ExamSecurityWrapper>
  );
}