import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Result from "./Schema.js";
import dotenv from 'dotenv';
const app=express();
app.use(express.json());
import { GoogleGenAI } from '@google/genai';
import { Type } from '@google/genai'; // Ensure Type is imported for Schema validation

dotenv.config();

app.use(cors({
    origin: true,
    credentials:true
}));

const MONGO_URL="mongodb://localhost:27017/MOck_Test";

const connectDB=async()=>{
    try {
        await mongoose.connect(MONGO_URL);
        console.log("database connected");
    }catch(e){
        console.log(e);
    }
};

connectDB();

app.post("/submit", async (req, res) => {
  try {
    const { topic, marks, percentage,details,sectionStats,difficulty } = req.body;

    // validation
    if (!topic || marks === undefined || !percentage) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // save to DB
    const newResult = new Result({
      topic,
      marks,
      percentage,
      details,
      sectionStats,
      difficulty
    });

    await newResult.save();
    
    res.status(200).json({
      message: "Data saved successfully",
      data: newResult,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.post("/api/generate-questions", async (req, res) => {
  try {
    const { subjects, numQuestions, difficulty, examType } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API configuration key missing on host." });
    }

    const totalCount = Number(numQuestions) || 20;

    // 1. Determine Category Weighting based on examType
    let techRatio = 0.8;
    let nonTechRatio = 0.2;

    if (examType && examType.toUpperCase() === "RRB") {
      techRatio = 0.7;
      nonTechRatio = 0.3;
    }

    // 2. Extract technical and non-technical sub-topics
    const techSubTopics = [];
    const nonTechSubTopics = [];

    (subjects || []).forEach(sub => {
      const category = (sub.category || "").toLowerCase();
      const subList = Array.isArray(sub.subTopics) ? sub.subTopics : [];

      if (category.includes("non-technical") || category.includes("non_technical")) {
        nonTechSubTopics.push(...subList);
      } else {
        techSubTopics.push(...subList);
      }
    });

    // 3. Calculate target counts based on availability
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

    // 4. Construct syllabus specification string
    let syllabusInstructions = "";
    if (techCount > 0) {
      syllabusInstructions += `\n- Technical Questions: EXACTLY ${techCount} questions distributed across these sub-topics: ${techSubTopics.join(", ")}`;
    }
    if (nonTechCount > 0) {
      syllabusInstructions += `\n- Non-Technical Questions: EXACTLY ${nonTechCount} questions distributed across these sub-topics: ${nonTechSubTopics.join(", ")}`;
    }

    // 5. Updated Prompt with strict ordering and mixing rules
    const prompt = `
You are an expert exam designer for the competitive examination: ${examType}.

Generate exactly ${totalCount} multiple-choice questions matching the Target Difficulty: ${(difficulty || "MEDIUM").toUpperCase()}.

Syllabus & Weightage Distribution Requirements:${syllabusInstructions}

ORDERING & STRUCTURING RULES:
1. All Technical questions (${techCount}) must be placed FIRST in the array, followed by all Non-Technical questions (${nonTechCount}) at the END.
2. INTERLEAVE / SHUFFLE SUB-TOPICS:
   - Within the Technical section: Do NOT group questions by the same sub-topic together. Interleave them so consecutive questions come from DIFFERENT technical sub-topics.
   - Within the Non-Technical section: Do NOT group questions by the same sub-topic together. Interleave them across the non-technical sub-topics.
3. For every question, set the "section" property EXACTLY to the name of the sub-topic it belongs to.
4. Provide 4 distinct options per question with exactly one correct answer. Keep questions concise and formatted in competitive exam one-liner style.
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
                items: { type: Type.STRING }
              },
              answer: { type: Type.STRING }
            },
            required: ["id", "section", "question", "options", "answer"]
          }
        }
      },
      required: ["questions"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema
      }
    });

    const quizData = JSON.parse(response.text);
    let questions = quizData.questions || [];

    // Optional Safety Net: Guarantee sub-topic shuffling in JS while keeping Tech first and Non-Tech last
    const techSet = new Set(techSubTopics);
    const techQuestions = questions.filter(q => techSet.has(q.section));
    const nonTechQuestions = questions.filter(q => !techSet.has(q.section));

    const shuffleArray = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Reassemble: shuffled technical first, shuffled non-technical second, re-indexed IDs
    const finalQuestions = [...shuffleArray(techQuestions), ...shuffleArray(nonTechQuestions)].map((q, idx) => ({
      ...q,
      id: idx + 1
    }));

    res.json({ questions: finalQuestions });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate dynamic AI questionnaire." });
  }
});
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/ai-analysis", async (req, res) => {
  try {
    const { score, percentage, questions, topic } = req.body;

if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Backend error: Gemini API key is missing." });
    }

    // 1. Filter the data beforehand so the AI only gets what it needs to analyze (Saves tokens & improves focus)
    const missedQuestions = questions.filter(q => q.status === 'wrong' || q.status === 'unattempted');

    // 2. Build the targeted prompt
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

    // 3. Request analysis from Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    // validation
    if (!id) {
      return res.status(400).json({
        message: "ID is required",
      });
    }

    // find data
    const result = await Result.findById(id);

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    res.status(200).json({
      message: "Result fetched successfully",
      data: result,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const results = await Result.find()
      .sort({ percentage: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});


// GET SINGLE RESULT DETAILS
app.get("/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.listen(8080,()=>{
    console.log("server start ");
});

