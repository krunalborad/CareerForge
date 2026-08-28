import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api/client.js";
import { Alert, Empty } from "../components/ui.jsx";

export default function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  const load = () => api.get("/jobs/mine").then(({ data }) => setJobs(data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this posting and all its applications?")) return;
    await api.delete(`/jobs/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">My job postings</h1>
        <Link to="/employer/jobs/new" className="btn-primary">Post a job</Link>
      </div>
      <Alert>{error}</Alert>
      {!jobs.length && <Empty title="No postings yet">Create your first job posting to start receiving applications.</Empty>}
      {jobs.map((j) => (
        <div key={j._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-bold">{j.title}</p>
            <p className="text-sm text-slate-600">{j.company} · {j.location} · {j.type} · <span className="capitalize">{j.status}</span></p>
            <p className="mt-1 text-xs text-slate-500">{j.applicants} applicant{j.applicants === 1 ? "" : "s"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-ghost" to={`/employer/jobs/${j._id}/applicants`}>Applicants</Link>
            <Link className="btn-ghost" to={`/employer/jobs/${j._id}/edit`}>Edit</Link>
            <button className="btn-danger" onClick={() => remove(j._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
