# CareerForge — MERN Job Portal + AI Resume Builder + AI Interview Prep

LinkedIn/Internshala-style job portal with an AI resume builder and a voice-based AI interview coach.
Stack: **MongoDB, Express, React (Vite), Node.js**, JWT auth, Multer uploads, PDFKit export, Recharts analytics, Tailwind CSS.

## Quick start (VS Code)

```bash
# 1. install everything
npm run install:all
npm install            # root, for the "dev" script

# 2. configure the backend
cp server/.env.example server/.env
#    edit MONGO_URI + JWT_SECRET (OPENAI_API_KEY optional)

# 3. load demo data
npm run seed

# 4. run API (5000) + client (5173) together
npm run dev
```

Open http://localhost:5173

### Demo logins
| Role | Email | Password |
|---|---|---|
| Admin | admin@careerforge.dev | admin123 |
| Employer | employer@careerforge.dev | employer123 |
| Candidate | candidate@careerforge.dev | candidate123 |

## AI configuration
Add `OPENAI_API_KEY` to `server/.env` to use GPT for question generation, answer feedback and resume writing.
**Without a key everything still works** — a built-in offline engine (question banks + heuristic scoring for structure,
STAR usage, quantification, filler words and keyword overlap) produces the same response shapes.

## Features
**Job portal** — search with keyword/location/type/work-mode/skills/salary/experience filters and pagination, job detail
with AI resume-match score, apply with resume + cover letter, candidate application tracker, employer dashboard
(post/edit/close/delete jobs, applicants ranked by AI match, status pipeline: applied → shortlisted → interview →
rejected → hired).

**AI resume builder** — 4 drag-and-drop templates, drag-to-reorder sections, AI-generated summary/bullets/projects,
live ATS score, PDF export (PDFKit), upload an existing PDF/DOCX/TXT resume, standalone ATS checker with
job-description keyword matching.

**AI interview prep** — role/level/focus-based question generation, browser microphone recording (MediaRecorder) with
live speech-to-text transcription, per-answer AI feedback (score, strengths, improvements), overall session score,
full interview history.

**Auth & admin** — JWT auth with bcrypt hashing, role-based route guards (candidate/employer/admin), profile editing,
admin panel with platform stats, signup chart, user role/ban management and job moderation.

## API map
`/api/auth` · `/api/jobs` · `/api/applications` · `/api/resumes` · `/api/interviews` · `/api/analytics` · `/api/admin`

## Notes
- Voice transcription uses the Web Speech API (Chrome/Edge). Elsewhere, type the answer — scoring still works.
- Uploads are stored in `server/uploads` and served at `/uploads`.
- The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`.
