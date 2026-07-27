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
    const { topic, numQuestions, difficulty } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API configuration key missing on host." });
    }

   const prompt = `
You are an expert exam designer specializing in high-stakes competitive medical laboratory examinations (e.g., AIIMS CRE, RRB Paramedical, WBHRB, and State LT exams).

Generate a quiz containing exactly ${numQuestions} multiple-choice questions on the topic: "${topic}".
Target Skill Level: ${difficulty.toUpperCase()}.

CRITICAL QUESTION STYLE AND QUALITY RULES (Based on AIIMS CRE / MLT Past Papers):
1. ⚡ Direct, Short & One-Liner Style: Keep questions concise, short, and to the point. Avoid lengthy clinical vignettes or wordy scenario descriptions unless strictly necessary for a calculation.
2. 🧠 Conceptual Traps & Edge Cases: Test technical accuracy, subtle distinctions (e.g., Direct vs. Indirect Coombs, specific fixatives, exact dye/reagent names), and clinical edge cases rather than trivial recall.
3. 🪤 Silly-Mistake Traps: Design options to catch candidates who read too fast (e.g., confusing "Except" clauses, interchanging unit scales like nm vs µm, or swapping pre-analytical vs analytical error types).
4. 🔍 Razor-Thin & Plausible Distractors: All 4 choices must be concise, grammatically parallel, and highly plausible. Distractors must represent exact incorrect steps or misinterpretations commonly made in a lab setting (e.g., wrong tube additive for a test, wrong BMW color bag, or incorrect path enzymes).
5. 🎯 Absolute Accuracy: Exactly one option must be undisputedly correct.
6. 📐 Precise Numerical & Lab Calculations: When including calculation-based questions (e.g., Molarity, Normality, Dilutions, GFR, or Cell Counts), ensure distractors reflect common arithmetic errors (e.g., forgetting molecular weight division or off-by-10 decimal errors).

Sub-Topic Distribution:
Divide the questions evenly across distinct sub-topics within "${topic}" and assign these sub-topic names to the "section" property field in the output JSON/object.
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

