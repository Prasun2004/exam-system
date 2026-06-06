export const calculateResult = (questionsData, answers) => {
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
        percentage: 0,
      };
    }

    sectionStats[q.section].total++;

    if (!userAns) {
      return {
        ...q,
        status: "unattempted",
        userAnswer: null,
      };
    }

    attempted++;
    sectionStats[q.section].attempted++;

    if (userAns === q.answer) {
      correct++;
      sectionStats[q.section].correct++;

      return {
        ...q,
        status: "correct",
        userAnswer: userAns,
      };
    } else {
      wrong++;
      sectionStats[q.section].wrong++;

      return {
        ...q,
        status: "wrong",
        userAnswer: userAns,
      };
    }
  });

  Object.keys(sectionStats).forEach((section) => {
    const sec = sectionStats[section];

    sec.percentage = (
      (sec.correct / sec.total) *
      100
    ).toFixed(2);
  });

  const totalQuestions = questionsData.length;

  const unattempted =
    totalQuestions - attempted;

  const scoreRaw = correct - wrong / 4;

  const percentage = (
    (scoreRaw / totalQuestions) *
    100
  ).toFixed(2);

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