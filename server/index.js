import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Result from "./Schema.js";
import dotenv from "dotenv";
import cron from "node-cron";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import { Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const MONGO_URL = "mongodb://localhost:27017/MOck_Test";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("database connected");
  } catch (e) {
    console.log(e);
  }
};

connectDB();

// =========================================================
//  EMAIL REMINDER CONFIG
// =========================================================
const REMINDER_EMAIL = "dsayanide@gmail.com"; // ← change this
const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_PASSWORD = process.env.FROM_PASSWORD;
const FIRST_REMINDER_AFTER_MS = 72 * 60 * 60 * 1000; // 72 hours
const REPEAT_EVERY_MS = 24 * 60 * 60 * 1000;         // every 24 hours


const DIFFICULTY_THRESHOLDS = {
  easy: 80,
  medium: 70,
  hard: 63,
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: FROM_EMAIL,
    pass: FROM_PASSWORD,
  },
});

async function sendReminderEmail(stillLockedTopics, failingExam, reminderNumber) {
  const topicList = stillLockedTopics.join(", ");

  const mailOptions = {
    from: FROM_EMAIL,
    to: REMINDER_EMAIL,
    subject: `⚠️ Quiz Reminder #${reminderNumber}: Restricted topics still incomplete`,
    html: `
      <h2>Practice Reminder</h2>
      <p>It has been more than 72 hours and you still have uncleared sub-topics.</p>
      <p><strong>Failing exam details:</strong></p>
      <ul>
        <li>Difficulty: ${failingExam.difficulty || "medium"}</li>
        <li>Score: ${failingExam.percentage}%</li>
        <li>Exam date: ${new Date(failingExam.createdAt).toLocaleString()}</li>
      </ul>
      <p><strong>Remaining topics (practice ALL to clear restriction):</strong></p>
      <p style="background:#fff3cd;padding:12px;border-radius:8px;font-weight:600;">
        ${topicList}
      </p>
      <p>This reminder repeats every 24 hours until you clear these topics.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Reminder #${reminderNumber} sent to`, REMINDER_EMAIL);
}

async function checkAndSendReminder() {
  try {
    // Newest first
    const results = await Result.find().sort({ createdAt: -1 }).lean();

    if (!results.length) {
      console.log("No exams found. Skip reminder.");
      return;
    }

    // Most recent exam date only (YYYY-MM-DD)
    const latestDate = new Date(results[0].createdAt)
      .toISOString()
      .slice(0, 10);

    const sameDayExams = results.filter(
      (exam) =>
        new Date(exam.createdAt).toISOString().slice(0, 10) === latestDate
    );

    // Most recent failing exam on that day
    let failingExam = null;
    let failingIndex = -1;

    for (let i = 0; i < sameDayExams.length; i++) {
      const exam = sameDayExams[i];
      const pct = parseFloat(exam.percentage);
      const diff = (exam.difficulty || "medium").toLowerCase();
      const threshold = DIFFICULTY_THRESHOLDS[diff] ?? 70;

      if (!isNaN(pct) && pct < threshold) {
        failingExam = exam;
        failingIndex = i;
        break;
      }
    }

    if (!failingExam) {
      console.log("No failing exam on latest day. No reminder.");
      return;
    }

    // Topics still locked?
    const restrictedTopics = (failingExam.topic || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const laterSameDay = sameDayExams.slice(0, failingIndex);
    const practicedAfter = new Set();
    laterSameDay.forEach((exam) => {
      (exam.topic || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => practicedAfter.add(t));
    });

    const stillLocked = restrictedTopics.filter((t) => !practicedAfter.has(t));

    if (stillLocked.length === 0) {
      console.log("All restricted topics cleared. No reminder.");
      return;
    }

    // ---- Time-based logic from ISO createdAt ----
    const createdAtMs = new Date(failingExam.createdAt).getTime();
    const now = Date.now();
    const elapsed = now - createdAtMs;

    // Not yet 72 hours
    if (elapsed < FIRST_REMINDER_AFTER_MS) {
      const hoursLeft = ((FIRST_REMINDER_AFTER_MS - elapsed) / (60 * 60 * 1000)).toFixed(1);
      console.log(`Too early. First reminder in ~${hoursLeft} hours.`);
      return;
    }

    // How many 24h slots have passed since the 72h mark?
    // slot 0 = first reminder (at 72h), slot 1 = at 96h, slot 2 = at 120h, ...
    const msAfter72 = elapsed - FIRST_REMINDER_AFTER_MS;
    const currentSlot = Math.floor(msAfter72 / REPEAT_EVERY_MS); // 0, 1, 2, ...

    // Use lastReminderSlot stored on the Result document
    const lastSentSlot =
      failingExam.lastReminderSlot === undefined || failingExam.lastReminderSlot === null
        ? -1
        : failingExam.lastReminderSlot;

    if (currentSlot <= lastSentSlot) {
      console.log(
        `Reminder for slot ${currentSlot} already sent (last=${lastSentSlot}). Skip.`
      );
      return;
    }

    // Send and mark this slot as done
    const reminderNumber = currentSlot + 1;
    await sendReminderEmail(stillLocked, failingExam, reminderNumber);

    await Result.findByIdAndUpdate(failingExam._id, {
      lastReminderSlot: currentSlot,
      lastReminderSentAt: new Date(),
    });

    console.log(`Marked lastReminderSlot=${currentSlot} on exam ${failingExam._id}`);
  } catch (err) {
    console.error("Reminder job failed:", err.message);
  }
}

// Check every hour (sends only when 72h+ and next 24h window is due)
cron.schedule("0 * * * *", () => {
  console.log("⏰ Hourly reminder check...");
  checkAndSendReminder();
});

console.log("📧 Reminder cron registered (every hour; first mail after 72h, then every 24h)");
// =========================================================
//  ROUTES
// =========================================================

app.post("/submit", async (req, res) => {
  try {
    const { topic, marks, percentage, details, sectionStats, difficulty } =
      req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    if (marks === undefined || marks === null) {
      return res.status(400).json({ message: "Marks are required" });
    }

    if (percentage === undefined || percentage === null) {
      return res.status(400).json({ message: "Percentage is required" });
    }

    const newResult = new Result({
      topic,
      marks,
      percentage,
      details,
      sectionStats,
      difficulty,
    });

    await newResult.save();

    res.status(200).json({
      message: "Data saved successfully",
      data: newResult,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/api/generate-questions", async (req, res) => {
  try {
    const { subjects, numQuestions, difficulty, examType } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: "Gemini API configuration key missing on host." });
    }

    const totalCount = Number(numQuestions) || 20;

    let techRatio = 0.8;
    let nonTechRatio = 0.2;

    if (examType && examType.toUpperCase() === "RRB") {
      techRatio = 0.7;
      nonTechRatio = 0.3;
    }

    const techSubTopics = [];
    const nonTechSubTopics = [];

    (subjects || []).forEach((sub) => {
      const category = (sub.category || "").toLowerCase();
      const subList = Array.isArray(sub.subTopics) ? sub.subTopics : [];

      if (
        category.includes("non-technical") ||
        category.includes("non_technical")
      ) {
        nonTechSubTopics.push(...subList);
      } else {
        techSubTopics.push(...subList);
      }
    });

    let techCount = 0;
    let nonTechCount = 0;

    if (techSubTopics.length > 0 && nonTechSubTopics.length > 0) {
      techCount = Math.round(totalCount * techRatio);
      nonTechCount = totalCount - techCount;
    } else if (techSubTopics.length > 0) {
      techCount = totalCount;
    } else {
      nonTechCount = totalCount;
    }

    let syllabusInstructions = "";
    if (techCount > 0) {
      syllabusInstructions += `\n- Technical Questions: EXACTLY ${techCount} questions distributed across these sub-topics: ${techSubTopics.join(", ")}`;
    }
    if (nonTechCount > 0) {
      syllabusInstructions += `\n- Non-Technical Questions: EXACTLY ${nonTechCount} questions distributed across these sub-topics: ${nonTechSubTopics.join(", ")}`;
    }

    const isCRE = examType && examType.toUpperCase() === "CRE";
    const isRRB = examType && examType.toUpperCase() === "RRB";

    let examSpecificRules = "";

    if (isCRE) {
      examSpecificRules = `
EXAM SPECIFIC GUIDELINES (CRE):
- Overall Tone: Grounded in foundational concepts, direct standard theory, and basic memory recall.
- Difficulty Calibration:
  * "EASY": Direct textbook definitions, standard terminology, fundamental laws, and direct one-liners.
  * "MEDIUM": Core conceptual questions requiring direct application of known rules/syntax/facts without twist.
  * "HARD": Slightly deeper syllabus depth or edge cases, but strictly limited and straightforward.
- STRICT NEGATIVE CONSTRAINT FOR CRE:
  * ZERO calculation-based or numerical problem-solving questions in the technical section (0% tolerance).
  * ZERO multi-line scenario/case-based questions. All questions must be clean, direct conceptual queries.`;
    } else if (isRRB) {
      examSpecificRules = `
EXAM SPECIFIC GUIDELINES (RRB):
- Overall Tone: Tougher, analytical, competitive, and designed to test elimination skills.
- Difficulty Baseline:
  * RRB "EASY" must match or exceed the difficulty of a CRE "MEDIUM".
  * Questions must include deceptive/tricky options, nuanced wording, exceptions to standard rules, and trap distractors.
  * Technical questions should test precise operational knowledge, practical specifications, boundary conditions, and short calculations where relevant.`;
    }

    const prompt = `
You are an expert exam designer for the competitive examination: ${examType}.

Generate exactly ${totalCount} multiple-choice questions matching the Target Difficulty: ${(difficulty || "MEDIUM").toUpperCase()}.

Syllabus & Weightage Distribution Requirements:${syllabusInstructions}

${examSpecificRules}

ORDERING & STRUCTURING RULES:
1. All Technical questions (${techCount}) must be placed FIRST in the array, followed by all Non-Technical questions (${nonTechCount}) at the END.
2. INTERLEAVE / SHUFFLE SUB-TOPICS:
   - Within Technical: Interleave questions across different technical sub-topics (no consecutive duplicates where possible).
   - Within Non-Technical: Interleave questions across different non-technical sub-topics.
3. For every question, set the "section" property EXACTLY to the name of the sub-topic it belongs to.
4. Provide 4 distinct options per question with exactly one indisputably correct answer. Keep stems concise and formatted in standard competitive exam style.
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
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
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
    let questions = quizData.questions || [];

    const techSet = new Set(techSubTopics);
    const techQuestions = questions.filter((q) => techSet.has(q.section));
    const nonTechQuestions = questions.filter((q) => !techSet.has(q.section));

    const shuffleArray = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const finalQuestions = [
      ...shuffleArray(techQuestions),
      ...shuffleArray(nonTechQuestions),
    ].map((q, idx) => ({
      ...q,
      id: idx + 1,
    }));

    res.json({ questions: finalQuestions });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate dynamic AI questionnaire." });
  }
});

app.post("/ai-analysis", async (req, res) => {
  try {
    const { score, percentage, questions, topic } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: "Backend error: Gemini API key is missing." });
    }

    const missedQuestions = questions.filter(
      (q) => q.status === "wrong" || q.status === "unattempted"
    );

    const prompt = `
      You are an expert academic tutor. Analyze the following list of questions that a student got WRONG or UNATTEMPTED in a recent "${topic}" exam. 
      
      Overall Exam Stats: Score ${score}, Percentage ${percentage}%.
      
      Data to analyze (Wrong and Skipped questions only):
      ${JSON.stringify(missedQuestions, null, 2)}
      
      Please generate a study guide formatted cleanly with these sections:
      
      1. 🧠 Error Breakdown & Logic:
         For each question provided in the data:
         - State the question number, section name, and the question text.
         - Clearly explain WHY the "Correct Answer" is right.
         - If they answered incorrectly, briefly explain the flaw in their choice ("userAnswer"). If they skipped it, explain the trap of the question.
         
      2. 📝 Target Concept Short Notes:
         Group the mistakes by their "section" topic (e.g., Idioms, Synonyms, Sentence Improvement). Provide a brief, 2-3 sentence high-value grammar rule, definition, or trick for that specific topic so they don't repeat the mistake.
         
      3. 💡 Memory Reminders:
         Provide 2-3 quick, catchy bullet-point "Mental Reminders" or mnemonics to keep in mind for future tests regarding these specific weak areas.

      Keep the tone highly encouraging, diagnostic, and structured. Use emojis for readability. Do not mention any questions that they got correct.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate AI tutoring report." });
  }
});

app.post("/get-result", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const result = await Result.findById(id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.status(200).json({
      message: "Result fetched successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const results = await Result.find().sort({ percentage: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Manual trigger for testing the reminder (optional)
app.post("/api/test-reminder", async (req, res) => {
  try {
    await checkAndSendReminder();
    res.json({ message: "Reminder check completed. Check server logs / email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE RESULT DETAILS
app.get("/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.listen(8080, () => {
  console.log("server start ");
});
