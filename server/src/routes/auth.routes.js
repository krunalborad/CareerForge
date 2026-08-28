import { Router } from "express";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const publicUser = (u) => ({
  id: u.id, name: u.name, email: u.email, role: u.role, headline: u.headline,
  location: u.location, skills: u.skills, experienceYears: u.experienceYears, company: u.company,
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "candidate", company } = req.body;
    if (!name || !email || !password) { res.status(400); throw new Error("Name, email and password are required"); }
    if (password.length < 6) { res.status(400); throw new Error("Password must be at least 6 characters"); }
    if (await User.findOne({ email: email.toLowerCase() })) { res.status(409); throw new Error("Email already registered"); }
    const user = await User.create({ name, email, password, role: role === "admin" ? "candidate" : role, company });
    res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password || ""))) { res.status(401); throw new Error("Invalid email or password"); }
    if (user.banned) { res.status(403); throw new Error("Account suspended"); }
    res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));

router.put("/me", protect, async (req, res, next) => {
  try {
    const fields = ["name", "headline", "location", "skills", "experienceYears", "company", "avatar"];
    fields.forEach((f) => { if (req.body[f] !== undefined) req.user[f] = req.body[f]; });
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (e) { next(e); }
});

export default router;
