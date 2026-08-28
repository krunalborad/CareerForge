import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    coverLetter: String,
    matchScore: { type: Number, default: 0 },
    matchReport: {},
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview", "rejected", "hired"],
      default: "applied",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
