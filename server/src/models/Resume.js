import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "My Resume" },
    template: { type: String, enum: ["modern", "classic", "compact", "creative"], default: "modern" },
    fileUrl: String,
    rawText: String,
    data: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      links: [String],
      summary: String,
      skills: [String],
      experience: [{ role: String, company: String, start: String, end: String, bullets: [String] }],
      education: [{ degree: String, school: String, year: String }],
      projects: [{ name: String, description: String, tech: [String] }],
      certifications: [String],
    },
    sectionOrder: { type: [String], default: ["summary", "skills", "experience", "projects", "education", "certifications"] },
    score: { type: Number, default: 0 },
    atsReport: {},
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
