import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Result from "./Schema.js";

const app=express();
app.use(express.json());

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

