import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    examId: {
    type: mongoose.Schema.Types.ObjectId,
      ref: "GeneratedExam",
      required: true,
      index: true,
  },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
    },

    marks: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    details: {
      type: Array,
      default: [],
    },

    sectionStats: {
      type: Array,
      default: [],
    },

    difficulty: {
      type: String,
      default: "medium",
    },

    lastReminderSlot: {
      type: Number,
      default: -1,
    },

    lastReminderSentAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

const Result =
  mongoose.model(
    "Result",
    resultSchema
  );

export default Result;