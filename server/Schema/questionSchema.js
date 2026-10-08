import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "technical",
        "non-technical",
        "Technical",
        "Non-Technical",
      ],
    },

    subTopics: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },

    section: {
      type: String,
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) =>
          Array.isArray(v) && v.length === 4,
        message:
          "Each question must have exactly 4 options",
      },
    },

    answer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const generatedExamSchema = new mongoose.Schema(
  {
    // ============================================
    // TEACHER
    // ============================================

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacherName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ============================================
    // SUBJECTS
    // ============================================

    subjects: {
      type: [subjectSchema],
      required: true,

      validate: {
        validator: (v) =>
          Array.isArray(v) && v.length > 0,

        message:
          "At least one subject is required",
      },
    },

    // ============================================
    // EXAM CONFIG
    // ============================================

    numQuestions: {
      type: Number,
      required: true,
      min: 5,
      max: 200,
    },

    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
      lowercase: true,
    },

    examType: {
      type: String,
      required: true,
      enum: ["RRB", "CRE"],
      uppercase: true,
    },

    totalTime: {
      type: Number,
      required: true,
      min: 15,
    },

    // ============================================
    // QUESTIONS
    // ============================================

    questions: {
      type: [questionSchema],
      required: true,

      validate: {
        validator: (v) =>
          Array.isArray(v) && v.length > 0,

        message:
          "Questions array is required and cannot be empty",
      },
    },

    // ============================================
    // STATUS
    // ============================================

    status: {
      type: String,
      enum: ["generated", "failed"],
      default: "generated",
    },
  },

  {
    timestamps: true,
  }
);

export const GeneratedExam =
  mongoose.model(
    "GeneratedExam",
    generatedExamSchema
  );