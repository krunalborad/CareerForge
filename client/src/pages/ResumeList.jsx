import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api/client.js";
import { Alert, Empty, ScoreRing } from "../components/ui.jsx";

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = () => api.get("/resumes").then(({ data }) => setResumes(data)).catch((e) => setMsg({ type: "error", text: errMsg(e) }));
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      await api.post("/resumes/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMsg({ type: "success", text: "Resume uploaded and scored." });
      load();
    } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
    finally { setUploading(false); fileRef.current.value = ""; }
  };

  const remove = async (id) => {
    if (!confirm("Delete this resume?")) return;
    await api.delete(`/resumes/${id}`);
    load();
  };

  const download = async (r) => {
    const res = await api.get(`/resumes/${r._id}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url; a.download = `${r.title}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">My resumes</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={upload} />
          <button className="btn-ghost" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload existing resume"}
          </button>
          <Link to="/resumes/new" className="btn-primary">New AI resume</Link>
        </div>
      </div>

      {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}
      {!resumes.length && <Empty title="No resumes yet">Build one with AI or upload a PDF to get an ATS score.</Empty>}

      <div className="grid gap-4 sm:grid-cols-2">
        {resumes.map((r) => (
          <div key={r._id} className="card flex items-center gap-4 p-4">
            <ScoreRing score={r.score} size={80} label="ATS" />
            <div className="flex-1">
              <p className="font-bold">{r.title}</p>
              <p className="text-xs text-slate-500">{r.template} · updated {new Date(r.updatedAt).toLocaleDateString()}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.fileUrl
                  ? <a className="btn-ghost" href={r.fileUrl} target="_blank" rel="noreferrer">Open file</a>
                  : <><Link className="btn-ghost" to={`/resumes/${r._id}`}>Edit</Link>
                     <button className="btn-ghost" onClick={() => download(r)}>PDF</button></>}
                <button className="btn-danger" onClick={() => remove(r._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
