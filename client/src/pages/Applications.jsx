import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api/client.js";
import { Alert, Empty, StatusBadge } from "../components/ui.jsx";

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [error, setError] = useState("");

  const load = () => api.get("/applications/mine").then(({ data }) => setApps(data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const withdraw = async (id) => {
    if (!confirm("Withdraw this application?")) return;
    await api.delete(`/applications/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">My applications</h1>
      <Alert>{error}</Alert>
      {!apps.length && <Empty title="No applications yet"><Link className="font-semibold text-brand-700" to="/jobs">Browse jobs →</Link></Empty>}
      {apps.map((a) => (
        <div key={a._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <Link to={`/jobs/${a.job?._id}`} className="font-bold text-ink hover:text-brand-700">{a.job?.title}</Link>
            <p className="text-sm text-slate-600">{a.job?.company} · {a.job?.location}</p>
            <p className="mt-1 text-xs text-slate-500">Applied {new Date(a.createdAt).toLocaleDateString()} · AI match {a.matchScore}%</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={a.status} />
            <button className="btn-ghost" onClick={() => withdraw(a._id)}>Withdraw</button>
          </div>
        </div>
      ))}
    </div>
  );
}
