import { Router } from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();
router.use(protect, authorize("admin"));

router.get("/overview", async (_req, res, next) => {
  try {
    const [users, jobs, applications, interviews, resumes, byRole, signups] = await Promise.all([
      User.countDocuments(), Job.countDocuments(), Application.countDocuments(),
      Interview.countDocuments(), Resume.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      User.aggregate([
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }, { $limit: 30 },
      ]),
    ]);
    res.json({
      stats: { users, jobs, applications, interviews, resumes },
      byRole: byRole.map((r) => ({ name: r._id, value: r.count })),
      signups: signups.map((s) => ({ name: s._id, value: s.count })),
    });
  } catch (e) { next(e); }
});

router.get("/users", async (req, res, next) => {
  try {
    const q = req.query.q ? { $or: [{ name: new RegExp(req.query.q, "i") }, { email: new RegExp(req.query.q, "i") }] } : {};
    res.json(await User.find(q).sort({ createdAt: -1 }).limit(200));
  } catch (e) { next(e); }
});

router.put("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error("User not found"); }
    if (req.body.role) user.role = req.body.role;
    if (req.body.banned !== undefined) user.banned = req.body.banned;
    await user.save();
    res.json(user);
  } catch (e) { next(e); }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) { res.status(400); throw new Error("You cannot delete your own admin account"); }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (e) { next(e); }
});

router.get("/jobs", async (_req, res, next) => {
  try { res.json(await Job.find().sort({ createdAt: -1 }).populate("employer", "name email").limit(200)); } catch (e) { next(e); }
});

router.delete("/jobs/:id", async (req, res, next) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });
    res.json({ message: "Job removed" });
  } catch (e) { next(e); }
});

export default router;
