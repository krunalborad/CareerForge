import { Router } from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import { protect, authorize } from "../middleware/auth.js";
import { matchResumeToJob } from "../services/ai.service.js";

const router = Router();

router.post("/", protect, async (req, res, next) => {
  try {
    const { jobId, resumeId, coverLetter } = req.body;
    const job = await Job.findById(jobId);
    if (!job || job.status !== "open") { res.status(404); throw new Error("Job unavailable"); }
    if (await Application.findOne({ job: jobId, candidate: req.user.id })) { res.status(409); throw new Error("You already applied to this job"); }

    const resume = resumeId
      ? await Resume.findOne({ _id: resumeId, owner: req.user.id })
      : await Resume.findOne({ owner: req.user.id }).sort({ updatedAt: -1 });

    const report = resume ? matchResumeToJob(resume.rawText || JSON.stringify(resume.data), job) : { score: 0, verdict: "No resume" };

    const application = await Application.create({
      job: jobId, candidate: req.user.id, resume: resume?._id, coverLetter,
      matchScore: report.score, matchReport: report,
    });
    res.status(201).json(application);
  } catch (e) { next(e); }
});

// Candidate: my applications
router.get("/mine", protect, async (req, res, next) => {
  try {
    const apps = await Application.find({ candidate: req.user.id })
      .sort({ createdAt: -1 })
      .populate("job", "title company location type status");
    res.json(apps);
  } catch (e) { next(e); }
});

// Employer: applicants for one of my jobs, ranked by AI match
router.get("/job/:jobId", protect, authorize("employer", "admin"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) { res.status(404); throw new Error("Job not found"); }
    if (String(job.employer) !== req.user.id && req.user.role !== "admin") { res.status(403); throw new Error("Not your job posting"); }
    const apps = await Application.find({ job: job._id })
      .sort({ matchScore: -1, createdAt: -1 })
      .populate("candidate", "name email headline location skills experienceYears")
      .populate("resume", "title fileUrl score");
    res.json({ job, applications: apps });
  } catch (e) { next(e); }
});

router.put("/:id/status", protect, authorize("employer", "admin"), async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id).populate("job");
    if (!app) { res.status(404); throw new Error("Application not found"); }
    if (String(app.job.employer) !== req.user.id && req.user.role !== "admin") { res.status(403); throw new Error("Forbidden"); }
    app.status = req.body.status;
    await app.save();
    res.json(app);
  } catch (e) { next(e); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) { res.status(404); throw new Error("Application not found"); }
    if (String(app.candidate) !== req.user.id && req.user.role !== "admin") { res.status(403); throw new Error("Forbidden"); }
    await app.deleteOne();
    res.json({ message: "Application withdrawn" });
  } catch (e) { next(e); }
});

export default router;
