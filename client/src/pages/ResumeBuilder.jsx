import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GripVertical, Sparkles, Download, Plus, Trash2 } from "lucide-react";
import api, { errMsg } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, ScoreRing } from "../components/ui.jsx";

const TEMPLATES = [
  { id: "modern", name: "Modern", accent: "#2563eb", desc: "Blue accents, clean rules" },
  { id: "classic", name: "Classic", accent: "#111827", desc: "Serif headings, formal" },
  { id: "compact", name: "Compact", accent: "#0f766e", desc: "Dense, one-page friendly" },
  { id: "creative", name: "Creative", accent: "#7c3aed", desc: "Bold colour, standout" },
];

const SECTION_LABELS = {
  summary: "Summary", skills: "Skills", experience: "Experience",
  projects: "Projects", education: "Education", certifications: "Certifications",
};

export default function ResumeBuilder() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState({
    title: "My Resume",
    template: "modern",
    sectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications"],
    data: {
      fullName: user?.name || "", email: user?.email || "", phone: "", location: user?.location || "",
      links: [], summary: "", skills: user?.skills || [], experience: [], education: [], projects: [], certifications: [],
    },
    score: 0, atsReport: { checks: [], suggestions: [] },
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragTemplate, setDragTemplate] = useState(null);

  useEffect(() => {
    if (id) api.get(`/resumes/${id}`).then(({ data }) => setResume(data)).catch((e) => setMsg({ type: "error", text: errMsg(e) }));
  }, [id]);

  const d = resume.data || {};
  const setData = (patch) => setResume((r) => ({ ...r, data: { ...r.data, ...patch } }));

  const save = async () => {
    setBusy(true); setMsg({ type: "", text: "" });
    try {
      const { data } = id ? await api.put(`/resumes/${id}`, resume) : await api.post("/resumes", resume);
      setResume(data);
      setMsg({ type: "success", text: `Saved. ATS score: ${data.score}/100` });
      if (!id) navigate(`/resumes/${data._id}`, { replace: true });
    } catch (e) { setMsg({ type: "error", text: errMsg(e) }); } finally { setBusy(false); }
  };

  const aiGenerate = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/resumes/generate", {
        targetRole: resume.title, skills: d.skills, experience: d.experience, projects: d.projects,
      });
      setData({ summary: data.summary, skills: data.skills, experience: data.experience, projects: data.projects });
      setMsg({ type: "success", text: "AI content generated — review and save." });
    } catch (e) { setMsg({ type: "error", text: errMsg(e) }); } finally { setBusy(false); }
  };

  const downloadPdf = async () => {
    if (!id) return setMsg({ type: "error", text: "Save the resume first." });
    const res = await api.get(`/resumes/${id}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url; a.download = `${d.fullName || "resume"}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  /* drag to reorder sections */
  const onDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) return;
    const order = [...resume.sectionOrder];
    const [moved] = order.splice(dragIdx, 1);
    order.splice(idx, 0, moved);
    setResume({ ...resume, sectionOrder: order });
    setDragIdx(null);
  };

  const addExp = () => setData({ experience: [...(d.experience || []), { role: "", company: "", start: "", end: "", bullets: [""] }] });
  const addEdu = () => setData({ education: [...(d.education || []), { degree: "", school: "", year: "" }] });
  const addProj = () => setData({ projects: [...(d.projects || []), { name: "", description: "", tech: [] }] });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input className="input max-w-xs text-lg font-bold" value={resume.title} onChange={(e) => setResume({ ...resume, title: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={aiGenerate} disabled={busy}><Sparkles size={15} /> AI write</button>
            <button className="btn-ghost" onClick={downloadPdf}><Download size={15} /> PDF</button>
            <button className="btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          </div>
        </div>
        {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}

        {/* Templates — drag one onto the canvas to apply */}
        <div className="card p-4">
          <h2 className="section-title">Templates <span className="text-xs font-normal text-slate-500">(drag onto the canvas below)</span></h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEMPLATES.map((t) => (
              <div key={t.id} draggable onDragStart={() => setDragTemplate(t.id)} onClick={() => setResume({ ...resume, template: t.id })}
                className={`cursor-grab rounded-lg border p-3 text-center transition ${resume.template === t.id ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200 hover:border-brand-300"}`}>
                <div className="mx-auto h-12 w-9 rounded-sm border border-slate-200" style={{ background: `linear-gradient(${t.accent} 22%, #fff 22%)` }} />
                <p className="mt-2 text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => dragTemplate && setResume({ ...resume, template: dragTemplate })}
          className="card space-y-5 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Canvas · template: {resume.template}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Full name</label><input className="input" value={d.fullName || ""} onChange={(e) => setData({ fullName: e.target.value })} /></div>
            <div><label className="label">Email</label><input className="input" value={d.email || ""} onChange={(e) => setData({ email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={d.phone || ""} onChange={(e) => setData({ phone: e.target.value })} /></div>
            <div><label className="label">Location</label><input className="input" value={d.location || ""} onChange={(e) => setData({ location: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Links (comma separated)</label>
              <input className="input" value={(d.links || []).join(", ")} onChange={(e) => setData({ links: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
          </div>

          {/* Draggable section order */}
          <div>
            <label className="label">Section order — drag to rearrange</label>
            <div className="space-y-2">
              {resume.sectionOrder.map((key, idx) => (
                <div key={key} draggable onDragStart={() => setDragIdx(idx)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(idx)}
                  className="flex cursor-grab items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
                  <GripVertical size={15} className="text-slate-400" /> {SECTION_LABELS[key]}
                </div>
              ))}
            </div>
          </div>

          <div><label className="label">Summary</label><textarea className="input h-24" value={d.summary || ""} onChange={(e) => setData({ summary: e.target.value })} /></div>
          <div><label className="label">Skills (comma separated)</label>
            <input className="input" value={(d.skills || []).join(", ")} onChange={(e) => setData({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>

          <div>
            <div className="flex items-center justify-between"><label className="label">Experience</label>
              <button className="btn-ghost" onClick={addExp}><Plus size={14} /> Add</button></div>
            {(d.experience || []).map((exp, i) => (
              <div key={i} className="mb-3 rounded-lg border border-slate-200 p-3">
                <div className="grid gap-2 sm:grid-cols-4">
                  <input className="input" placeholder="Role" value={exp.role || ""} onChange={(e) => { const x = [...d.experience]; x[i] = { ...exp, role: e.target.value }; setData({ experience: x }); }} />
                  <input className="input" placeholder="Company" value={exp.company || ""} onChange={(e) => { const x = [...d.experience]; x[i] = { ...exp, company: e.target.value }; setData({ experience: x }); }} />
                  <input className="input" placeholder="Start" value={exp.start || ""} onChange={(e) => { const x = [...d.experience]; x[i] = { ...exp, start: e.target.value }; setData({ experience: x }); }} />
                  <input className="input" placeholder="End" value={exp.end || ""} onChange={(e) => { const x = [...d.experience]; x[i] = { ...exp, end: e.target.value }; setData({ experience: x }); }} />
                </div>
                <textarea className="input mt-2 h-20" placeholder="One bullet per line"
                  value={(exp.bullets || []).join("\n")}
                  onChange={(e) => { const x = [...d.experience]; x[i] = { ...exp, bullets: e.target.value.split("\n") }; setData({ experience: x }); }} />
                <button className="mt-2 text-xs font-semibold text-rose-600" onClick={() => setData({ experience: d.experience.filter((_, j) => j !== i) })}>
                  <Trash2 size={12} className="inline" /> Remove
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between"><label className="label">Projects</label>
              <button className="btn-ghost" onClick={addProj}><Plus size={14} /> Add</button></div>
            {(d.projects || []).map((p, i) => (
              <div key={i} className="mb-3 grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
                <input className="input" placeholder="Name" value={p.name || ""} onChange={(e) => { const x = [...d.projects]; x[i] = { ...p, name: e.target.value }; setData({ projects: x }); }} />
                <input className="input sm:col-span-2" placeholder="Description" value={p.description || ""} onChange={(e) => { const x = [...d.projects]; x[i] = { ...p, description: e.target.value }; setData({ projects: x }); }} />
                <input className="input sm:col-span-3" placeholder="Tech (comma separated)" value={(p.tech || []).join(", ")} onChange={(e) => { const x = [...d.projects]; x[i] = { ...p, tech: e.target.value.split(",").map((s) => s.trim()) }; setData({ projects: x }); }} />
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between"><label className="label">Education</label>
              <button className="btn-ghost" onClick={addEdu}><Plus size={14} /> Add</button></div>
            {(d.education || []).map((e0, i) => (
              <div key={i} className="mb-2 grid gap-2 sm:grid-cols-3">
                <input className="input" placeholder="Degree" value={e0.degree || ""} onChange={(e) => { const x = [...d.education]; x[i] = { ...e0, degree: e.target.value }; setData({ education: x }); }} />
                <input className="input" placeholder="School" value={e0.school || ""} onChange={(e) => { const x = [...d.education]; x[i] = { ...e0, school: e.target.value }; setData({ education: x }); }} />
                <input className="input" placeholder="Year" value={e0.year || ""} onChange={(e) => { const x = [...d.education]; x[i] = { ...e0, year: e.target.value }; setData({ education: x }); }} />
              </div>
            ))}
          </div>

          <div><label className="label">Certifications (comma separated)</label>
            <input className="input" value={(d.certifications || []).join(", ")} onChange={(e) => setData({ certifications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card grid place-items-center gap-3 p-5">
          <ScoreRing score={resume.score} label="ATS" />
          <p className="text-center text-xs text-slate-500">Score updates every time you save.</p>
        </div>
        {!!resume.atsReport?.checks?.length && (
          <div className="card p-4">
            <h3 className="section-title">ATS checklist</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {resume.atsReport.checks.map((c) => (
                <li key={c.label} className={c.pass ? "text-emerald-700" : "text-rose-700"}>{c.pass ? "✓" : "✕"} {c.label}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
