import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import requireAuth from "../utils/authMiddleware.js";
import requireRole from "../utils/roleMiddleware.js";
import { GeneratedExam } from "../Schema/questionSchema.js";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// SHARED GENERATION HELPER
// =====================================================

async function generateQuestionsWithAI({
  subjects,
  numQuestions,
  difficulty,
  examType,
  totalTime,
  teacherId,
  teacherName,
  email,
}) {
  const totalCount = Number(numQuestions) || 20;

  let techRatio = 0.8;
  let nonTechRatio = 0.2;

  if (examType.toUpperCase() === "RRB") {
    techRatio = 0.7;
    nonTechRatio = 0.3;
  }

  let technicalTopics = [];
  let nonTechnicalTopics = [];

  subjects.forEach((group) => {
    const category = (group.category || "").toLowerCase();
    const subTopics = Array.isArray(group.subTopics) ? group.subTopics : [];

    if (category.includes("non-technical") || category.includes("non_technical")) {
      nonTechnicalTopics.push(...subTopics);
    } else {
      technicalTopics.push(...subTopics);
    }
  });

  technicalTopics = [...new Set(technicalTopics)];
  nonTechnicalTopics = [...new Set(nonTechnicalTopics)];

  let techCount = 0;
  let nonTechCount = 0;

  if (technicalTopics.length > 0 && nonTechnicalTopics.length > 0) {
    techCount = Math.round(totalCount * techRatio);
    nonTechCount = totalCount - techCount;
  } else if (technicalTopics.length > 0) {
    techCount = totalCount;
  } else if (nonTechnicalTopics.length > 0) {
    nonTechCount = totalCount;
  }

  let syllabusInstructions = "";

  if (techCount > 0) {
    syllabusInstructions += `
- Technical Questions: EXACTLY ${techCount} questions.
- Technical sub-topics:
${technicalTopics.map((topic) => `  - ${topic}`).join("\n")}
`;
  }

  if (nonTechCount > 0) {
    syllabusInstructions += `
- Non-Technical Questions: EXACTLY ${nonTechCount} questions.
- Non-Technical sub-topics:
${nonTechnicalTopics.map((topic) => `  - ${topic}`).join("\n")}
`;
  }

  const isCRE = examType.toUpperCase() === "CRE";
  const isRRB = examType.toUpperCase() === "RRB";

  let examSpecificRules = "";

  if (isCRE) {
    examSpecificRules = `
EXAM SPECIFIC GUIDELINES (CRE):
- Overall Tone: Grounded in foundational concepts, direct standard theory, and basic memory recall.
- EASY: Direct textbook definitions, standard terminology, fundamental laws, direct one-liners.
- MEDIUM: Core conceptual questions.
- HARD: Slightly deeper syllabus depth or edge cases.
- ZERO calculation-based questions in technical section.
- ZERO multi-line case-based questions.
`;
  }

  if (isRRB) {
    examSpecificRules = `
EXAM SPECIFIC GUIDELINES (RRB):
- Tougher and analytical.
- EASY should match or exceed CRE MEDIUM.
- Use deceptive/tricky options.
- Use nuanced wording.
- Use exceptions.
- Technical questions should test practical knowledge and calculations.
`;
  }

  const prompt = `
You are an expert exam designer for the competitive examination: ${examType}.

Generate exactly ${totalCount} multiple-choice questions.

Target difficulty:
${difficulty.toUpperCase()}

SYLLABUS:

${syllabusInstructions}

${examSpecificRules}

GENERAL RULES:

1. Generate EXACTLY ${totalCount} questions.
2. Technical questions must be EXACTLY ${techCount}.
3. Non-Technical questions must be EXACTLY ${nonTechCount}.
4. Follow only the supplied syllabus/sub-topics.
5. Do not generate questions outside the selected sub-topics.
6. Interleave questions from different sub-topics where possible.
7. The "section" field must EXACTLY equal the selected sub-topic name.
8. Every question must have exactly four distinct options.
9. There must be exactly one correct answer.
10. Keep questions suitable for ${examType}.
11. Do not duplicate questions.
12. Return only valid JSON according to the supplied schema.
`;

  const questionSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            section: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
          },
          required: ["id", "section", "question", "options", "answer"],
        },
      },
    },
    required: ["questions"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: questionSchema,
    },
  });

  const quizData = JSON.parse(response.text);
  const questions = quizData.questions || [];

  if (!questions.length) {
    throw new Error("No questions were generated by AI.");
  }

  if (questions.length !== totalCount) {
    throw new Error(`AI generated ${questions.length} questions instead of ${totalCount}.`);
  }

  const finalQuestions = questions.map((q, idx) => ({
    id: idx + 1,
    section: q.section,
    question: q.question,
    options: q.options,
    answer: q.answer,
  }));

  const examRecord = await GeneratedExam.create({
    teacherId,
    teacherName,
    email,
    subjects,
    numQuestions: Number(numQuestions),
    difficulty: difficulty.toLowerCase(),
    examType: examType.toUpperCase(),
    totalTime: Number(totalTime),
    questions: finalQuestions,
    status: "generated",
  });

  return {
    examId: examRecord._id,
    questions: finalQuestions,
  };
}

// =====================================================
// GENERATE QUESTIONS (Teacher only)
// =====================================================

router.post(
  "/generate-questions",
  requireAuth,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { subjects, numQuestions, difficulty, examType, totalTime } = req.body;

      const teacherId = req.user.id;
      const teacherName = req.user.name;
      const email = req.user.email;

      if (
        !subjects ||
        !Array.isArray(subjects) ||
        subjects.length === 0 ||
        !numQuestions ||
        !difficulty ||
        !examType ||
        !totalTime
      ) {
        return res.status(400).json({
          success: false,
          error: "Required fields: subjects, numQuestions, difficulty, examType, totalTime",
        });
      }

      if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: "Difficulty must be one of: easy, medium, hard",
        });
      }

      if (!["RRB", "CRE"].includes(examType.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: "examType must be either RRB or CRE",
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          error: "Gemini API key missing.",
        });
      }

      const result = await generateQuestionsWithAI({
        subjects,
        numQuestions,
        difficulty,
        examType,
        totalTime,
        teacherId,
        teacherName,
        email,
      });

      return res.status(201).json({
        success: true,
        message: "Questions generated and saved successfully",
        examId: result.examId,
        questions: result.questions,
      });
    } catch (error) {
      console.error("AI Generation Error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to generate dynamic AI questionnaire.",
        details: error.message,
      });
    }
  }
);

// =====================================================
// STUDENT RETAKE – generate NEW questions for locked topics
// =====================================================

router.post("/retake-exam", requireAuth, async (req, res) => {
  try {
    const {
      originalExamId,
      topics,
      difficulty,
      examType,
      numQuestions,
      totalTime,
    } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        error: "topics array is required",
      });
    }

    if (!difficulty || !examType) {
      return res.status(400).json({
        success: false,
        error: "difficulty and examType are required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Gemini API key missing.",
      });
    }

    // Build subjects structure for the generator
    const subjects = [
      {
        category: "Technical",
        subject: topics.join(", "),
        subTopics: topics,
      },
    ];

    const result = await generateQuestionsWithAI({
      subjects,
      numQuestions: numQuestions || 20,
      difficulty: difficulty.toLowerCase(),
      examType: examType.toUpperCase(),
      totalTime: totalTime || 2400,
      teacherId: req.user.id,
      teacherName: req.user.name || "Student Retake",
      email: req.user.email,
    });

    return res.status(201).json({
      success: true,
      message: "Retake exam generated successfully",
      examId: result.examId,
      questions: result.questions,
      originalExamId: originalExamId || null,
      topics,
    });
  } catch (error) {
    console.error("Retake Generation Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate retake exam.",
      details: error.message,
    });
  }
});

// =====================================================
// AI ANALYSIS
// =====================================================

router.post("/ai-analysis", requireAuth, async (req, res) => {
  try {
    const { score, percentage, questions, topic } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is missing." });
    }

    const missedQuestions = questions.filter(
      (q) => q.status === "wrong" || q.status === "unattempted"
    );

    const prompt = `
You are an expert academic tutor.

Analyze the questions a student got WRONG or UNATTEMPTED.

Topic:
${topic}

Score:
${score}

Percentage:
${percentage}%

Questions:
${JSON.stringify(missedQuestions, null, 2)}

Generate:

1. Error Breakdown & Logic:
   - Provide a ultra-concise breakdown.
   - For closely matched options or tricky distractors, clearly point out the exact discriminating nuance or edge case that separates the correct answer from the trap.

2. Target Concept Short Notes:
   - High-yield, bite-sized summaries.
   - Keep points crisp and direct (no lengthy exposition).

3. Memory Reminders:
   - Bulleted mnemonics, quick formulas, or rule-of-thumb checks.

Strict Rules:
- Keep all explanations punchy, diagnostic, and structured; avoid long-winded text regardless of the difficulty level.
- Focus specifically on why near-identical/confusing options fail.
- Keep the tone encouraging.
- Do not mention questions that were answered correctly.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.json({ analysis: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "Failed to generate AI tutoring report." });
  }
});

export default router;