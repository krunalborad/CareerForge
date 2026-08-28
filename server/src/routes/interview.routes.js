import { Router } from "express";
import Interview from "../models/Interview.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { generateQuestions, evaluateAnswer } from "../services/ai.service.js";

const router = Router();

router.post("/", protect, async (req, res, next) => {
  try {
    const { role = "Full Stack Developer", level = "junior", focus = "mixed", count = 6 } = req.body;
    const questions = await generateQuestions({ role, level, focus, count });
    const interview = await Interview.create({ user: req.user.id, role, level, focus, questions });
    res.status(201).json(interview);
  } catch (e) { next(e); }
});

router.get("/", protect, async (req, res, next) => {
  try { res.json(await Interview.find({ user: req.user.id }).sort({ createdAt: -1 })); } catch (e) { next(e); }
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    const i = await Interview.findOne({ _id: req.params.id, user: req.user.id });
    if (!i) { res.status(404); throw new Error("Interview not found"); }
    res.json(i);
  } catch (e) { next(e); }
});

// Submit an answer: transcript (from browser speech recognition) + optional audio blob
router.post("/:id/answer", protect, upload.single("audio"), async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
    if (!interview) { res.status(404); throw new Error("Interview not found"); }

    const questionIndex = Number(req.body.questionIndex || 0);
    const transcript = req.body.transcript || "";
    const question = interview.questions[questionIndex]?.text || "";
    const feedback = await evaluateAnswer({ question, transcript, role: interview.role, level: interview.level });

    const answer = {
      questionIndex,
      transcript,
      durationSec: Number(req.body.durationSec || 0),
      audioUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      feedback,
    };

    const existing = interview.answers.findIndex((a) => a.questionIndex === questionIndex);
    if (existing >= 0) interview.answers[existing] = answer;
    else interview.answers.push(answer);

    const scores = interview.answers.map((a) => a.feedback?.score || 0);
    interview.overallScore = Math.round(scores.reduce((s, n) => s + n, 0) / scores.length);
    if (interview.answers.length >= interview.questions.length) interview.status = "completed";
    await interview.save();
    res.json({ answer, overallScore: interview.overallScore, status: interview.status });
  } catch (e) { next(e); }
});

router.post("/:id/complete", protect, async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, { status: "completed" }, { new: true }
    );
    if (!interview) { res.status(404); throw new Error("Interview not found"); }
    res.json(interview);
  } catch (e) { next(e); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    await Interview.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Interview deleted" });
  } catch (e) { next(e); }
});

export default router;
