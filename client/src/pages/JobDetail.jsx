import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, ScoreRing } from "../components/ui.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [match, setMatch] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data)).catch((e) => setMsg({ type: "error", text: errMsg(e) }));
    if (user?.role === "candidate") {
      api.get("/resumes").then(({ data }) => { setResumes(data); setResumeId(data[0]?._id || ""); }).catch(() => {});
      api.get(`/jobs/${id}/match`).then(({ data }) => setMatch(data)).catch(() => {});
    }
  }, [id, user]);

  const apply = async () => {
    setBusy(true); setMsg({ type: "", text: "" });
    try {
      await api.post("/applications", { jobId: id, resumeId: resumeId || undefined, coverLetter });
      setMsg({ type: "success", text: "Application submitted! Track it under Applications." });
    } catch (e) { setMsg({ type: "error", text: errMsg(e) }); } finally { setBusy(false); }
  };

  if (!job) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <article className="card p-6">
        <h1 className="text-2xl font-extrabold">{job.title}</h1>
        <p className="mt-1 text-slate-600">{job.company} · {job.location} · {job.workMode} · {job.type}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills?.map((s) => <span key={s} className="chip capitalize">{s}</span>)}
        </div>
        <h2 className="section-title mt-6">About the role</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="label">Experience</dt><dd>{job.experienceMin}+ years</dd></div>
          <div><dt className="label">Openings</dt><dd>{job.openings}</dd></div>
          <div><dt className="label">Compensation</dt><dd>{job.stipend ? `₹${job.stipend.toLocaleString()}/mo` : job.salaryMin ? `₹${job.salaryMin.toLocaleString()} – ₹${job.salaryMax?.toLocaleString()}` : "Not disclosed"}</dd></div>
          <div><dt className="label">Posted</dt><dd>{new Date(job.createdAt).toLocaleDateString()}</dd></div>
        </dl>
      </article>

      <aside className="space-y-4">
        {match && (
          <div className="card flex items-center gap-4 p-4">
            <ScoreRing score={match.score} size={84} label="Match" />
            <div className="text-sm">
              <p className="font-bold">{match.verdict}</p>
              {match.missingSkills?.length > 0 && (
                <p className="mt-1 text-slate-600">Missing: {match.missingSkills.join(", ")}</p>
              )}
            </div>
          </div>
        )}

        <div className="card space-y-3 p-4">
          <h2 className="section-title">Apply</h2>
          {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}
          {!user && (
            <>
              <p className="text-sm text-slate-600">Log in as a candidate to apply.</p>
              <button className="btn-primary w-full" onClick={() => navigate("/login", { state: { from: `/jobs/${id}` } })}>Log in to apply</button>
            </>
          )}
          {user?.role === "candidate" && (
            <>
              <div>
                <label className="label">Resume</label>
                <select className="input" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                  <option value="">Latest resume</option>
                  {resumes.map((r) => <option key={r._id} value={r._id}>{r.title} ({r.score}/100)</option>)}
                </select>
                {!resumes.length && <Link to="/resumes" className="mt-1 block text-xs font-semibold text-brand-700">Create a resume first →</Link>}
              </div>
              <div>
                <label className="label">Cover letter</label>
                <textarea className="input h-28" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Why are you a great fit?" />
              </div>
              <button className="btn-primary w-full" onClick={apply} disabled={busy}>{busy ? "Submitting…" : "Submit application"}</button>
            </>
          )}
          {user && user.role !== "candidate" && <p className="text-sm text-slate-600">Only candidate accounts can apply.</p>}
        </div>
      </aside>
    </div>
  );
}
