import { askJSON } from "./openai.js";
import { TECH_BANK, BEHAVIOURAL_BANK, ACTION_VERBS, STOP_WORDS } from "../utils/banks.js";

export const tokenize = (text = "") =>
  (text.toLowerCase().match(/[a-z0-9+#.]{2,}/g) || []).filter((w) => !STOP_WORDS.has(w));

/* ---------------------------------- Questions --------------------------------- */
export async function generateQuestions({ role, level, focus, count = 6 }) {
  const llm = await askJSON(
    "You are a senior technical interviewer. Reply with JSON: {\"questions\":[{\"text\":\"...\",\"category\":\"technical|behavioural|system-design\"}]}",
    `Create ${count} interview questions for a ${level} ${role}. Focus area: ${focus}.`
  );
  if (llm?.questions?.length) return llm.questions.slice(0, count);

  const key = Object.keys(TECH_BANK).find((k) => role.toLowerCase().includes(k)) || "general";
  const tech = TECH_BANK[key].map((t) => ({ text: t.replace("{level}", level), category: "technical" }));
  const behav = BEHAVIOURAL_BANK.map((t) => ({ text: t, category: "behavioural" }));
  const mixed = focus === "technical" ? tech : focus === "behavioural" ? behav : interleave(tech, behav);
  return mixed.slice(0, count);
}

const interleave = (a, b) =>
  Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i], b[i]]).flat().filter(Boolean);

/* ---------------------------------- Feedback ---------------------------------- */
export async function evaluateAnswer({ question, transcript, role, level }) {
  const llm = await askJSON(
    "You are an interview coach. Reply with JSON: {\"score\":0-100,\"strengths\":[],\"improvements\":[],\"summary\":\"\"}",
    `Role: ${level} ${role}\nQuestion: ${question}\nCandidate answer: ${transcript}`
  );
  if (llm?.score != null) return llm;

  const words = (transcript || "").trim().split(/\s+/).filter(Boolean);
  const qTokens = new Set(tokenize(question));
  const aTokens = tokenize(transcript);
  const overlap = aTokens.filter((t) => qTokens.has(t)).length;
  const usesSTAR = /(situation|task|action|result|impact|outcome)/i.test(transcript || "");
  const quantified = /\d+(\.\d+)?\s*(%|percent|x|users|ms|seconds|hours|k|m)?/i.test(transcript || "");
  const filler = (transcript.match(/\b(um|uh|like|basically|actually|you know)\b/gi) || []).length;

  let score = 30;
  score += Math.min(25, Math.round(words.length / 6));
  score += Math.min(15, overlap * 3);
  if (usesSTAR) score += 12;
  if (quantified) score += 10;
  score -= Math.min(15, filler * 2);
  score = Math.max(5, Math.min(98, score));

  const strengths = [];
  const improvements = [];
  if (words.length > 70) strengths.push("Answer has good depth and detail.");
  else improvements.push("Expand your answer — aim for 90–150 spoken words.");
  if (usesSTAR) strengths.push("Follows a clear STAR-like structure.");
  else improvements.push("Structure the answer as Situation → Task → Action → Result.");
  if (quantified) strengths.push("Backs claims with concrete numbers.");
  else improvements.push("Quantify impact (%, time saved, users affected).");
  if (overlap >= 2) strengths.push("Stays on topic and addresses the question directly.");
  else improvements.push("Reuse key terms from the question so the answer clearly maps to it.");
  if (filler > 3) improvements.push(`Reduce filler words — detected ${filler}.`);

  return {
    score,
    strengths,
    improvements,
    summary: `Scored ${score}/100 on clarity, structure and relevance for a ${level} ${role} interview.`,
  };
}

/* ------------------------------ Resume generation ----------------------------- */
export async function generateResumeContent(profile) {
  const llm = await askJSON(
    "You are a professional resume writer. Reply with JSON: {\"summary\":\"\",\"skills\":[],\"experience\":[{\"role\":\"\",\"company\":\"\",\"start\":\"\",\"end\":\"\",\"bullets\":[]}],\"projects\":[{\"name\":\"\",\"description\":\"\",\"tech\":[]}]}",
    JSON.stringify(profile)
  );
  if (llm?.summary) return llm;

  const skills = profile.skills?.length ? profile.skills : ["JavaScript", "React", "Node.js", "MongoDB"];
  const target = profile.targetRole || "Software Engineer";
  return {
    summary: `${target} with ${profile.experienceYears || 1}+ years building production web applications. Strong in ${skills
      .slice(0, 4)
      .join(", ")}, with a track record of shipping features end-to-end and improving performance and reliability.`,
    skills,
    experience: (profile.experience?.length ? profile.experience : [{ role: target, company: profile.company || "Freelance", start: "2023", end: "Present", bullets: [] }]).map(
      (exp, i) => ({
        ...exp,
        bullets:
          exp.bullets?.length
            ? exp.bullets
            : [
                `${ACTION_VERBS[i % ACTION_VERBS.length]} core features using ${skills.slice(0, 3).join(", ")}, cutting page load time by 35%.`,
                `Collaborated with a cross-functional team of 5 to deliver releases on a two-week cadence.`,
                `Wrote automated tests raising coverage to 80% and reducing production defects by 40%.`,
              ],
      })
    ),
    projects: profile.projects?.length
      ? profile.projects
      : [{ name: "CareerForge", description: "Full-stack MERN job portal with AI resume tooling.", tech: skills.slice(0, 4) }],
  };
}

/* --------------------------------- ATS check ---------------------------------- */
export function atsCheck(resumeText, jobDescription = "") {
  const text = resumeText || "";
  const lower = text.toLowerCase();
  const checks = [];
  const add = (label, pass, weight, hint) => checks.push({ label, pass, weight, hint });

  add("Contact email present", /[\w.+-]+@[\w-]+\.[\w.]+/.test(text), 8, "Add a professional email address.");
  add("Phone number present", /(\+?\d[\d\s-]{7,})/.test(text), 6, "Add a reachable phone number.");
  add("Has an experience section", /(experience|employment|work history)/i.test(text), 12, "Add a clearly labelled Experience section.");
  add("Has an education section", /education|b\.?tech|bachelor|master/i.test(text), 8, "Add an Education section.");
  add("Has a skills section", /skills|technologies|tech stack/i.test(text), 10, "List your skills in a dedicated section.");
  add("Uses action verbs", ACTION_VERBS.some((v) => lower.includes(v.toLowerCase())), 10, "Start bullets with verbs like Built, Led, Optimised.");
  add("Quantified achievements", /\d+\s?%|\d+x|\$\d+|\d+\s?(users|ms|hours)/i.test(text), 12, "Add measurable results to your bullets.");
  add("Reasonable length", text.split(/\s+/).length >= 200 && text.split(/\s+/).length <= 900, 8, "Keep the resume between 200 and 900 words.");
  add("No tables/graphics markers", !/\|\s*-{2,}|\t{2,}/.test(text), 6, "Avoid tables and multi-column layouts — parsers mangle them.");
  add("No personal pronouns", !/\b(i|me|my)\b/i.test(text.slice(0, 1200)), 5, "Write in an implied first person; drop 'I' and 'my'.");

  let keywordScore = 0;
  let missingKeywords = [];
  let matchedKeywords = [];
  if (jobDescription.trim()) {
    const jd = [...new Set(tokenize(jobDescription))];
    matchedKeywords = jd.filter((k) => lower.includes(k));
    missingKeywords = jd.filter((k) => !lower.includes(k)).slice(0, 20);
    keywordScore = Math.round((matchedKeywords.length / Math.max(1, jd.length)) * 15);
  }

  const earned = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const base = Math.round((earned / total) * (jobDescription.trim() ? 85 : 100));
  const score = Math.min(100, base + keywordScore);

  return {
    score,
    checks,
    matchedKeywords: matchedKeywords.slice(0, 30),
    missingKeywords,
    suggestions: checks.filter((c) => !c.pass).map((c) => c.hint),
  };
}

/* ------------------------------- Job <-> resume ------------------------------- */
export function matchResumeToJob(resumeText, job) {
  const required = [...new Set((job.skills || []).map((s) => s.toLowerCase()))];
  const lower = (resumeText || "").toLowerCase();
  const matched = required.filter((s) => lower.includes(s));
  const missing = required.filter((s) => !lower.includes(s));

  const jdTokens = [...new Set(tokenize(`${job.title} ${job.description}`))];
  const jdMatched = jdTokens.filter((t) => lower.includes(t));
  const skillScore = required.length ? (matched.length / required.length) * 70 : 45;
  const textScore = (jdMatched.length / Math.max(1, jdTokens.length)) * 30;
  const score = Math.round(Math.min(100, skillScore + textScore));

  return {
    score,
    matchedSkills: matched,
    missingSkills: missing,
    verdict: score >= 75 ? "Strong match" : score >= 50 ? "Possible match" : "Weak match",
  };
}
