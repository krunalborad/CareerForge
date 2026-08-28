import { Router } from "express";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Resume from "../models/Resume.js";
import { protect, authorize } from "../middleware/auth.js";
import { matchResumeToJob } from "../services/ai.service.js";

const router = Router();

// Public search with filters + pagination
router.get("/", async (req, res, next) => {
  try {
    const { q, location, type, workMode, skills, minSalary, experience, page = 1, limit = 10, sort = "recent" } = req.query;
    const filter = { status: "open" };
    if (q) filter.$or = [
      { title: new RegExp(q, "i") },
      { company: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
    ];
    if (location) filter.location = new RegExp(location, "i");
    if (type) filter.type = { $in: String(type).split(",") };
    if (workMode) filter.workMode = { $in: String(workMode).split(",") };
    if (skills) filter.skills = { $in: String(skills).split(",").map((s) => s.trim().toLowerCase()) };
    if (minSalary) filter.salaryMax = { $gte: Number(minSalary) };
    if (experience) filter.experienceMin = { $lte: Number(experience) };

    const sortMap = { recent: { createdAt: -1 }, salary: { salaryMax: -1 }, title: { title: 1 } };
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Job.find(filter).sort(sortMap[sort] || sortMap.recent).skip(skip).limit(Number(limit)).populate("employer", "name company"),
      Job.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { next(e); }
});

router.get("/mine", protect, authorize("employer", "admin"), async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 }).lean();
    const counts = await Application.aggregate([
      { $match: { job: { $in: jobs.map((j) => j._id) } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    res.json(jobs.map((j) => ({ ...j, applicants: map[String(j._id)] || 0 })));
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "name company");
    if (!job) { res.status(404); throw new Error("Job not found"); }
    res.json(job);
  } catch (e) { next(e); }
});

// AI match of my latest resume against a job
router.get("/:id/match", protect, async (req, res, next) => {
  try {
    const [job, resume] = await Promise.all([
      Job.findById(req.params.id),
      Resume.findOne({ owner: req.user.id }).sort({ updatedAt: -1 }),
    ]);
    if (!job) { res.status(404); throw new Error("Job not found"); }
    if (!resume) return res.json({ score: 0, verdict: "No resume", matchedSkills: [], missingSkills: job.skills });
    res.json(matchResumeToJob(resume.rawText || JSON.stringify(resume.data), job));
  } catch (e) { next(e); }
});

router.post("/", protect, authorize("employer", "admin"), async (req, res, next) => {
  try {
    const job = await Job.create({
      ...req.body,
      skills: (req.body.skills || []).map((s) => String(s).toLowerCase()),
      employer: req.user.id,
    });
    res.status(201).json(job);
  } catch (e) { next(e); }
});

router.put("/:id", protect, authorize("employer", "admin"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404); throw new Error("Job not found"); }
    if (String(job.employer) !== req.user.id && req.user.role !== "admin") { res.status(403); throw new Error("Not your job posting"); }
    Object.assign(job, req.body);
    if (req.body.skills) job.skills = req.body.skills.map((s) => String(s).toLowerCase());
    await job.save();
    res.json(job);
  } catch (e) { next(e); }
});

router.delete("/:id", protect, authorize("employer", "admin"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404); throw new Error("Job not found"); }
    if (String(job.employer) !== req.user.id && req.user.role !== "admin") { res.status(403); throw new Error("Not your job posting"); }
    await job.deleteOne();
    await Application.deleteMany({ job: job._id });
    res.json({ message: "Job deleted" });
  } catch (e) { next(e); }
});

export default router;
