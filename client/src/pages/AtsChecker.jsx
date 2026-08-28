import { useEffect, useState } from "react";
import api, { errMsg } from "../api/client.js";
import { Alert, ScoreRing } from "../components/ui.jsx";

export default function AtsChecker() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [text, setText] = useState("");
  const [jd, setJd] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/resumes").then(({ data }) => setResumes(data)).catch(() => {}); }, []);

  const run = async () => {
    setBusy(true); setError("");
    try {
      const { data } = await api.post("/resumes/ats", { resumeId: resumeId || undefined, text: text || undefined, jobDescription: jd });
      setReport(data);
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-4 p-5">
        <h1 className="text-2xl font-extrabold">ATS checker & JD matcher</h1>
        <Alert>{error}</Alert>
        <div>
          <label className="label">Use a saved resume</label>
          <select className="input" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            <option value="">— paste text instead —</option>
            {resumes.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
          </select>
        </div>
        {!resumeId && <div><label className="label">Resume text</label><textarea className="input h-40" value={text} onChange={(e) => setText(e.target.value)} /></div>}
        <div><label className="label">Job description (optional)</label><textarea className="input h-40" value={jd} onChange={(e) => setJd(e.target.value)} /></div>
        <button className="btn-primary" onClick={run} disabled={busy}>{busy ? "Analysing…" : "Run ATS check"}</button>
      </div>

      <div className="space-y-4">
        {!report && <div className="card grid h-full place-items-center p-10 text-sm text-slate-500">Your report will appear here.</div>}
        {report && (
          <>
            <div className="card grid place-items-center gap-2 p-5"><ScoreRing score={report.score} size={120} label="ATS" /></div>
            <div className="card p-4">
              <h3 className="section-title">Checks</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {report.checks.map((c) => <li key={c.label} className={c.pass ? "text-emerald-700" : "text-rose-700"}>{c.pass ? "✓" : "✕"} {c.label}</li>)}
              </ul>
            </div>
            {!!report.suggestions.length && (
              <div className="card p-4"><h3 className="section-title">Fix these</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{report.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            )}
            {!!report.missingKeywords?.length && (
              <div className="card p-4"><h3 className="section-title">Missing JD keywords</h3>
                <div className="mt-2 flex flex-wrap gap-2">{report.missingKeywords.map((k) => <span key={k} className="chip bg-rose-100 text-rose-700">{k}</span>)}</div></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
