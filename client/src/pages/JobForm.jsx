import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api/client.js";
import { Alert } from "../components/ui.jsx";

const blank = {
  title: "", company: "", description: "", location: "Remote", type: "full-time", workMode: "remote",
  skills: "", experienceMin: 0, salaryMin: "", salaryMax: "", stipend: "", openings: 1, status: "open",
};

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/jobs/${id}`).then(({ data }) => setForm({ ...data, skills: (data.skills || []).join(", ") }));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    const payload = {
      ...form,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      experienceMin: Number(form.experienceMin) || 0,
      openings: Number(form.openings) || 1,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      stipend: form.stipend ? Number(form.stipend) : undefined,
    };
    try {
      if (id) await api.put(`/jobs/${id}`, payload);
      else await api.post("/jobs", payload);
      navigate("/employer/jobs");
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <form className="card mx-auto max-w-2xl space-y-4 p-6" onSubmit={submit}>
      <h1 className="text-2xl font-extrabold">{id ? "Edit posting" : "Post a job"}</h1>
      <Alert>{error}</Alert>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Title</label><input className="input" required value={form.title} onChange={set("title")} /></div>
        <div><label className="label">Company</label><input className="input" required value={form.company} onChange={set("company")} /></div>
        <div><label className="label">Location</label><input className="input" value={form.location} onChange={set("location")} /></div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={set("type")}>
            {["full-time", "part-time", "internship", "contract"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Work mode</label>
          <select className="input" value={form.workMode} onChange={set("workMode")}>
            {["onsite", "remote", "hybrid"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="label">Min experience (years)</label><input className="input" type="number" min="0" value={form.experienceMin} onChange={set("experienceMin")} /></div>
        <div><label className="label">Salary min (₹/yr)</label><input className="input" type="number" value={form.salaryMin || ""} onChange={set("salaryMin")} /></div>
        <div><label className="label">Salary max (₹/yr)</label><input className="input" type="number" value={form.salaryMax || ""} onChange={set("salaryMax")} /></div>
        <div><label className="label">Stipend (₹/mo, internships)</label><input className="input" type="number" value={form.stipend || ""} onChange={set("stipend")} /></div>
        <div><label className="label">Openings</label><input className="input" type="number" min="1" value={form.openings} onChange={set("openings")} /></div>
        {id && (
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set("status")}><option>open</option><option>closed</option></select>
          </div>
        )}
      </div>
      <div><label className="label">Required skills (comma separated)</label><input className="input" value={form.skills} onChange={set("skills")} placeholder="react, node.js, mongodb" /></div>
      <div><label className="label">Description</label><textarea className="input h-40" required value={form.description} onChange={set("description")} /></div>
      <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : id ? "Save changes" : "Publish job"}</button>
    </form>
  );
}
