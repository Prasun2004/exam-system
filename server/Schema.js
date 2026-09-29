import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  percentage: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required:true
  },
  details:{
    type:Array,
    require:true,
  },
  sectionStats:{
    type:Object,
    require:true,
  },
  lastReminderSlot: {
     type: Number,
     default: -1 
    }, // -1 = never sent
    lastReminderSentAt: { 
      type: Date 
    },
});

const Result = mongoose.model("Result", resultSchema);

export default Result;