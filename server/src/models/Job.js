import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, index: "text" },
    company: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: "Remote" },
    type: { type: String, enum: ["full-time", "part-time", "internship", "contract"], default: "full-time" },
    workMode: { type: String, enum: ["onsite", "remote", "hybrid"], default: "onsite" },
    skills: [String],
    experienceMin: { type: Number, default: 0 },
    salaryMin: Number,
    salaryMax: Number,
    stipend: Number,
    openings: { type: Number, default: 1 },
    deadline: Date,
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
