import express from "express";
import dotenv from "dotenv";
import Result from "../Schema/ResultSchema.js";
import requireAuth from "../utils/authMiddleware.js";
import {GeneratedExam} from "../Schema/questionSchema.js"
import mongoose from "mongoose";

dotenv.config();

const router = express.Router();

router.post(
  "/submit",
  requireAuth,
  async (req, res) => {

    try {

      const {
        examId,
        topic,
        marks,
        percentage,
        details,
        sectionStats,
        difficulty,
      } = req.body;

      console.log(examId);

      if (!topic) {

        return res.status(400).json({
          success: false,
          message:
            "Topic is required",
        });
      }


      if (
        marks === undefined ||
        marks === null
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Marks are required",
        });
      }


      if (
        percentage === undefined ||
        percentage === null
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Percentage is required",
        });
      }


      const newResult =
        new Result({
          examId,

          topic,

          marks,

          percentage,

          details,

          sectionStats,

          difficulty,

          // Add this to your Result schema
          userId: req.user.id,
        });


      await newResult.save();


      return res.status(201).json({
        success: true,
        message:
          "Data saved successfully",

        data: newResult,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  }
);


router.post(
  "/get-result",
  requireAuth,
  async (req, res) => {

    try {

      const { id } =
        req.body;


      if (!id) {

        return res.status(400).json({
          success: false,
          message:
            "ID is required",
        });
      }


      const result =
        await Result.findOne({
          _id: id,
          userId:req.user.id,
        });


      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "Result not found",
        });
      }


      return res.json({
        success: true,

        message:
          "Result fetched successfully",

        data: result,
      });


    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  }
);


// =====================================================
// LEADERBOARD
// =====================================================

router.get(
  "/leaderboard",
  requireAuth,
  async (req, res) => {

    try {

      const results =
        await Result.find()
          .sort({
            percentage: -1,
          });


      return res.json(
        results
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);

router.get(
  "/result_details/:id",
  requireAuth,
  async (req, res) => {

    try {

      const result =
        await Result.findOne({
          _id:
            req.params.id,

          userId:
            req.user.id,
        });


      if (!result) {

        return res.status(404).json({
          message:
            "Result not found",
        });
      }


      return res.json(
        result
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);

router.get(
  "/exam-question",
  requireAuth,
  async (req, res) => {
    try {
      const exams = await GeneratedExam.find({
        status: "generated",
      })
        .sort({ createdAt: -1 })
        .lean();

      const formattedExams = exams.map((exam, index) => {
        // Get first subject name
        const subjectName =
          exam.subjects?.[0]?.subject ||
          "Mock Test";

        // Create title
        const title =
          exam.examType === "RRB"
            ? `${subjectName}`
            : `${subjectName}`;

        return {
          id: exam._id,

          name: exam.teacherName,

          avatar: `https://i.pravatar.cc/150?img=${
            (index % 70) + 1
          }`,

          title: title,

          mode: exam.difficulty,

          questions: exam.questions?.length || exam.numQuestions,

          time: exam.totalTime,

          type: exam.examType.toLowerCase(),
          
        };
      });

      return res.status(200).json({
        success: true,
        exams: formattedExams,
      });
    } catch (error) {
      console.error(
        "Get Generated Exams Error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to fetch generated exams",
      });
    }
  }
);

router.get(
  "/generated-exams/:id",
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid exam ID",
        });
      }

      const exam = await GeneratedExam.findOne({
        _id: id,
        status: "generated",
      }).lean();

      if (!exam) {
        return res.status(404).json({
          success: false,
          error: "Exam not found",
        });
      }

      return res.status(200).json({
        success: true,
        exam: {
          id: exam._id,
          name: exam.teacherName,
          avatar: `https://i.pravatar.cc/150?img=1`,
          title:
            exam.subjects
              ?.map((s) => s.subject)
              .join(" + ") || "Mock Test",

          mode: exam.difficulty,

          questions:
            exam.questions || [],

          questionsCount:
            exam.questions?.length ||
            exam.numQuestions,

          totalTime: exam.totalTime,

          difficulty: exam.difficulty,

          examType: exam.examType,

          subjects: exam.subjects || [],
        },
      });
    } catch (error) {
      console.error(
        "Get Single Exam Error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to fetch exam",
      });
    }
  }
);

export default router;

