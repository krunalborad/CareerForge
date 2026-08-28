import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionIndex: Number,
    transcript: String,
    audioUrl: String,
    durationSec: Number,
    feedback: {
      score: Number,
      strengths: [String],
      improvements: [String],
      summary: String,
    },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    level: { type: String, enum: ["intern", "junior", "mid", "senior"], default: "junior" },
    focus: { type: String, default: "mixed" },
    questions: [{ text: String, category: String }],
    answers: [answerSchema],
    overallScore: { type: Number, default: 0 },
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
