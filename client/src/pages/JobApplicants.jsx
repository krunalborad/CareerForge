import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { errMsg } from "../api/client.js";
import { Alert, Empty, StatusBadge } from "../components/ui.jsx";

const STATUSES = ["applied", "shortlisted", "interview", "rejected", "hired"];

export default function JobApplicants() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.get(`/applications/job/${id}`).then(({ data }) => setData(data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, [id]);

  const setStatus = async (appId, status) => {
    await api.put(`/applications/${appId}/status`, { status });
    load();
  };

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">{data.job.title}</h1>
        <p className="text-sm text-slate-500">Applicants ranked by AI resume match</p>
      </div>
      {!data.applications.length && <Empty title="No applicants yet">Share your posting to attract candidates.</Empty>}
      {data.applications.map((a) => (
        <div key={a._id} className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">{a.candidate?.name} <span className="text-sm font-normal text-slate-500">· {a.candidate?.email}</span></p>
              <p className="text-sm text-slate-600">{a.candidate?.headline} · {a.candidate?.location} · {a.candidate?.experienceYears} yrs</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(a.matchReport?.matchedSkills || []).map((s) => <span key={s} className="chip bg-emerald-100 text-emerald-800 capitalize">{s}</span>)}
                {(a.matchReport?.missingSkills || []).map((s) => <span key={s} className="chip bg-rose-100 text-rose-700 capitalize">{s}</span>)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-brand-700">{a.matchScore}%</p>
              <p className="text-xs text-slate-500">{a.matchReport?.verdict}</p>
            </div>
          </div>
          {a.coverLetter && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{a.coverLetter}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={a.status} />
            <select className="input w-44" value={a.status} onChange={(e) => setStatus(a._id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {a.resume?.fileUrl && <a className="btn-ghost" href={a.resume.fileUrl} target="_blank" rel="noreferrer">View resume file</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
