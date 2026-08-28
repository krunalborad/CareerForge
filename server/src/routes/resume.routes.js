import { Router } from "express";
import fs from "fs";
import path from "path";
import Resume from "../models/Resume.js";
import Job from "../models/Job.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { atsCheck, generateResumeContent, matchResumeToJob } from "../services/ai.service.js";
import { buildResumePDF } from "../services/pdf.service.js";

const router = Router();

const flatten = (r) => {
  const d = r.data || {};
  return [
    d.fullName, d.email, d.phone, d.location, (d.links || []).join(" "), "Summary", d.summary,
    "Skills", (d.skills || []).join(", "), "Experience",
    ...(d.experience || []).map((e) => `${e.role} ${e.company} ${e.start} ${e.end} ${(e.bullets || []).join(" ")}`),
    "Projects", ...(d.projects || []).map((p) => `${p.name} ${p.description} ${(p.tech || []).join(" ")}`),
    "Education", ...(d.education || []).map((e) => `${e.degree} ${e.school} ${e.year}`),
    "Certifications", (d.certifications || []).join(", "),
  ].filter(Boolean).join("\n");
};

router.get("/", protect, async (req, res, next) => {
  try { res.json(await Resume.find({ owner: req.user.id }).sort({ updatedAt: -1 })); } catch (e) { next(e); }
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    const r = await Resume.findOne({ _id: req.params.id, owner: req.user.id });
    if (!r) { res.status(404); throw new Error("Resume not found"); }
    res.json(r);
  } catch (e) { next(e); }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const resume = new Resume({ ...req.body, owner: req.user.id });
    resume.rawText = flatten(resume);
    const report = atsCheck(resume.rawText);
    resume.score = report.score;
    resume.atsReport = report;
    await resume.save();
    res.status(201).json(resume);
  } catch (e) { next(e); }
});

router.put("/:id", protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, owner: req.user.id });
    if (!resume) { res.status(404); throw new Error("Resume not found"); }
    ["title", "template", "data", "sectionOrder"].forEach((k) => { if (req.body[k] !== undefined) resume[k] = req.body[k]; });
    resume.rawText = flatten(resume);
    const report = atsCheck(resume.rawText);
    resume.score = report.score;
    resume.atsReport = report;
    await resume.save();
    res.json(resume);
  } catch (e) { next(e); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const r = await Resume.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!r) { res.status(404); throw new Error("Resume not found"); }
    res.json({ message: "Resume deleted" });
  } catch (e) { next(e); }
});

// AI content generation from a profile brief
router.post("/generate", protect, async (req, res, next) => {
  try {
    const content = await generateResumeContent({
      name: req.user.name, email: req.user.email, skills: req.user.skills,
      experienceYears: req.user.experienceYears, ...req.body,
    });
    res.json(content);
  } catch (e) { next(e); }
});

// Upload an existing resume file (PDF/DOCX/TXT)
router.post("/upload", protect, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) { res.status(400); throw new Error("No file uploaded"); }
    let text = "";
    const ext = path.extname(req.file.filename).toLowerCase();
    try {
      if (ext === ".pdf") {
        const { default: pdfParse } = await import("pdf-parse");
        text = (await pdfParse(fs.readFileSync(req.file.path))).text;
      } else if (ext === ".txt") {
        text = fs.readFileSync(req.file.path, "utf8");
      }
    } catch (err) {
      console.warn("Resume text extraction failed:", err.message);
    }

    const report = atsCheck(text);
    const resume = await Resume.create({
      owner: req.user.id,
      title: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      rawText: text,
      score: report.score,
      atsReport: report,
    });
    res.status(201).json(resume);
  } catch (e) { next(e); }
});

// Standalone ATS checker (text or stored resume) with optional JD
router.post("/ats", protect, async (req, res, next) => {
  try {
    let text = req.body.text;
    if (!text && req.body.resumeId) {
      const r = await Resume.findOne({ _id: req.body.resumeId, owner: req.user.id });
      text = r?.rawText || "";
    }
    if (!text) { res.status(400); throw new Error("Provide resume text or a resumeId"); }
    res.json(atsCheck(text, req.body.jobDescription || ""));
  } catch (e) { next(e); }
});

// Match a resume to a specific job
router.post("/:id/match/:jobId", protect, async (req, res, next) => {
  try {
    const [resume, job] = await Promise.all([
      Resume.findOne({ _id: req.params.id, owner: req.user.id }),
      Job.findById(req.params.jobId),
    ]);
    if (!resume || !job) { res.status(404); throw new Error("Resume or job not found"); }
    res.json(matchResumeToJob(resume.rawText || flatten(resume), job));
  } catch (e) { next(e); }
});

// PDF export
router.get("/:id/pdf", protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, owner: req.user.id });
    if (!resume) { res.status(404); throw new Error("Resume not found"); }
    buildResumePDF(resume, res);
  } catch (e) { next(e); }
});

export default router;
