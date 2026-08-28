import { Router } from "express";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import Job from "../models/Job.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", protect, async (req, res, next) => {
  try {
    if (req.user.role === "employer") {
      const jobs = await Job.find({ employer: req.user.id }).select("_id title");
      const ids = jobs.map((j) => j._id);
      const [total, byStatus, perJob] = await Promise.all([
        Application.countDocuments({ job: { $in: ids } }),
        Application.aggregate([{ $match: { job: { $in: ids } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
        Application.aggregate([
          { $match: { job: { $in: ids } } },
          { $group: { _id: "$job", count: { $sum: 1 }, avgMatch: { $avg: "$matchScore" } } },
        ]),
      ]);
      const titles = Object.fromEntries(jobs.map((j) => [String(j._id), j.title]));
      return res.json({
        role: "employer",
        stats: { jobs: jobs.length, applications: total },
        byStatus: byStatus.map((s) => ({ name: s._id, value: s.count })),
        perJob: perJob.map((p) => ({ name: titles[String(p._id)] || "Job", applications: p.count, avgMatch: Math.round(p.avgMatch || 0) })),
      });
    }

    const [apps, interviews, resumes] = await Promise.all([
      Application.find({ candidate: req.user.id }).populate("job", "title"),
      Interview.find({ user: req.user.id }).sort({ createdAt: 1 }),
      Resume.find({ owner: req.user.id }).select("title score updatedAt"),
    ]);

    const byStatus = ["applied", "shortlisted", "interview", "rejected", "hired"].map((s) => ({
      name: s, value: apps.filter((a) => a.status === s).length,
    }));

    const scoreTrend = interviews.map((i, idx) => ({
      name: `#${idx + 1} ${i.role}`.slice(0, 18),
      score: i.overallScore,
      date: i.createdAt,
    }));

    const skillGaps = {};
    apps.forEach((a) => (a.matchReport?.missingSkills || []).forEach((s) => { skillGaps[s] = (skillGaps[s] || 0) + 1; }));

    res.json({
      role: "candidate",
      stats: {
        applications: apps.length,
        interviews: interviews.length,
        resumes: resumes.length,
        avgInterviewScore: interviews.length ? Math.round(interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length) : 0,
        bestResumeScore: resumes.length ? Math.max(...resumes.map((r) => r.score)) : 0,
        avgMatchScore: apps.length ? Math.round(apps.reduce((s, a) => s + a.matchScore, 0) / apps.length) : 0,
      },
      byStatus,
      scoreTrend,
      skillGaps: Object.entries(skillGaps).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
      resumes,
    });
  } catch (e) { next(e); }
});

export default router;
