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
  },
  details:{
    type:Array,
    require:true,
  },
  sectionStats:{
    type:Object,
    require:true,
  }
});

const Result = mongoose.model("Result", resultSchema);

export default Result;