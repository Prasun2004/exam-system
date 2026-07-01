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
    const { topic, marks, percentage,details,sectionStats } = req.body;

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
      sectionStats
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
    const { topic, numQuestions, difficulty } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API configuration key missing on host." });
    }

    const prompt = `
      You are an expert exam designer specializing in high-stakes competitive examinations. 
      Generate a quiz containing exactly ${numQuestions} multiple-choice questions on the topic: "${topic}".
      Target Skill Level: ${difficulty.toUpperCase()}.

      CRITICAL QUESTION STYLE AND QUALITY RULES:
      1. 🧠 Tricky & Brain-Storming: The questions must test conceptual depth, edge cases, or common misconceptions, not raw memorization.
      2. ⚡ Concise & Short: Keep the question text short and direct. Avoid long paragraphs or wordy scenarios.
      3. 🪤 Silly Mistake Traps: Design the questions to catch students who read too quickly or make superficial assumptions (e.g., swapping a sign, misinterpreting a absolute vs relative term, or missing a subtle logical constraint).
      4. 🔍 Razor-Thin Options: All 4 choices must be incredibly close, highly plausible, and grammatically/structurally parallel. Distractors should represent the exact incorrect answers a student would get if they made a common calculation error or logical misstep.
      5. 🎯 Absolute Accuracy: Exactly one choice must be undisputedly correct.

      Divide the questions evenly across distinct sub-topics (assign these sub-topics to the "section" property field).
    `;

    // Strict schema to ensure the data format perfectly matches what your application uses
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
            required: ["id", "section", "question", "options", "answer"],
          }
        }
      },
      required: ["questions"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
      }
    });

    // Parse the strict JSON string coming from Gemini safely
    const quizData = JSON.parse(response.text);
    
    res.json({ questions: quizData.questions });

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

