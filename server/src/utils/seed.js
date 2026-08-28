import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const jobs = [
  { title: "Frontend Developer", company: "Nimbus Labs", location: "Bengaluru", type: "full-time", workMode: "hybrid", skills: ["react", "typescript", "css", "redux"], experienceMin: 2, salaryMin: 900000, salaryMax: 1600000, description: "Build customer-facing dashboards in React and TypeScript. You will own component architecture, performance budgets and accessibility." },
  { title: "Backend Engineer (Node.js)", company: "Payflow", location: "Remote", type: "full-time", workMode: "remote", skills: ["node.js", "express", "mongodb", "redis"], experienceMin: 3, salaryMin: 1400000, salaryMax: 2400000, description: "Design and scale payment APIs with Node.js, Express and MongoDB. Strong grasp of security, idempotency and queues required." },
  { title: "Full Stack Intern", company: "Zestly", location: "Pune", type: "internship", workMode: "onsite", skills: ["javascript", "react", "node.js", "mongodb"], experienceMin: 0, stipend: 25000, description: "Six-month MERN internship. Ship real features alongside senior engineers, from API design to UI polish." },
  { title: "Data Analyst", company: "Metricly", location: "Hyderabad", type: "full-time", workMode: "hybrid", skills: ["sql", "python", "pandas", "tableau"], experienceMin: 1, salaryMin: 700000, salaryMax: 1200000, description: "Turn product data into decisions. Build dashboards, run experiments and partner with product managers." },
  { title: "DevOps Engineer", company: "Cloudkite", location: "Remote", type: "contract", workMode: "remote", skills: ["docker", "kubernetes", "aws", "terraform"], experienceMin: 4, salaryMin: 1800000, salaryMax: 3000000, description: "Own CI/CD, infrastructure as code and observability for a multi-region Kubernetes platform." },
  { title: "Product Design Intern", company: "Nimbus Labs", location: "Bengaluru", type: "internship", workMode: "hybrid", skills: ["figma", "prototyping", "user research"], experienceMin: 0, stipend: 20000, description: "Work with product and engineering to research, prototype and ship interface improvements." },
];

async function run() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Job.deleteMany({})]);

  const admin = await User.create({ name: "Admin", email: "admin@careerforge.dev", password: "admin123", role: "admin" });
  const employer = await User.create({ name: "Riya Employer", email: "employer@careerforge.dev", password: "employer123", role: "employer", company: "Nimbus Labs" });
  const employer2 = await User.create({ name: "Sam Recruiter", email: "recruiter@careerforge.dev", password: "employer123", role: "employer", company: "Payflow" });
  await User.create({ name: "Aarav Candidate", email: "candidate@careerforge.dev", password: "candidate123", role: "candidate", headline: "Full Stack Developer", location: "Pune", skills: ["react", "node.js", "mongodb", "express"], experienceYears: 2 });

  await Job.insertMany(jobs.map((j, i) => ({ ...j, employer: i % 2 === 0 ? employer._id : employer2._id })));

  console.log("Seeded. Logins:");
  console.log("  admin@careerforge.dev / admin123");
  console.log("  employer@careerforge.dev / employer123");
  console.log("  candidate@careerforge.dev / candidate123");
  console.log("  (admin id:", admin.id, ")");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
