import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { errMsg } from "../api/client.js";
import { Alert } from "../components/ui.jsx";

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: "Full Stack Developer", level: "junior", focus: "mixed", count: 6 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true); setError("");
    try {
      const { data } = await api.post("/interviews", { ...form, count: Number(form.count) });
      navigate(`/interview/${data._id}`);
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-lg card space-y-4 p-6">
      <h1 className="text-2xl font-extrabold">Start a mock interview</h1>
      <p className="text-sm text-slate-500">AI generates questions for your role, you answer by voice, and get scored feedback instantly.</p>
      <Alert>{error}</Alert>
      <div><label className="label">Target role</label><input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
      <div><label className="label">Level</label>
        <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
          {["intern", "junior", "mid", "senior"].map((l) => <option key={l}>{l}</option>)}
        </select></div>
      <div><label className="label">Focus</label>
        <select className="input" value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })}>
          <option value="mixed">Mixed</option><option value="technical">Technical</option><option value="behavioural">Behavioural</option>
        </select></div>
      <div><label className="label">Questions</label><input className="input" type="number" min="3" max="12" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} /></div>
      <button className="btn-primary w-full" onClick={start} disabled={busy}>{busy ? "Generating…" : "Generate questions & start"}</button>
      <Link to="/interviews" className="block text-center text-sm font-semibold text-brand-700">View past interviews →</Link>
    </div>
  );
}
