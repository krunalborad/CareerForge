import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api, { errMsg } from "../api/client.js";
import { StatCard, Alert } from "../components/ui.jsx";

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const loadUsers = (query = "") => api.get(`/admin/users?q=${query}`).then(({ data }) => setUsers(data)).catch((e) => setError(errMsg(e)));
  const loadJobs = () => api.get("/admin/jobs").then(({ data }) => setJobs(data)).catch((e) => setError(errMsg(e)));

  useEffect(() => {
    api.get("/admin/overview").then(({ data }) => setOverview(data)).catch((e) => setError(errMsg(e)));
    loadUsers(); loadJobs();
  }, []);

  const patchUser = async (id, patch) => { await api.put(`/admin/users/${id}`, patch); loadUsers(q); };
  const delUser = async (id) => { if (confirm("Delete this user?")) { await api.delete(`/admin/users/${id}`); loadUsers(q); } };
  const delJob = async (id) => { if (confirm("Remove this job?")) { await api.delete(`/admin/jobs/${id}`); loadJobs(); } };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Admin panel</h1>
      <Alert>{error}</Alert>
      <div className="flex gap-2">
        {["overview", "users", "jobs"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${tab === t ? "bg-brand-600 text-white" : "bg-white border border-slate-200"}`}>{t}</button>
        ))}
      </div>

      {tab === "overview" && overview && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(overview.stats).map(([k, v]) => <StatCard key={k} label={k} value={v} />)}
          </div>
          <div className="card p-5">
            <h2 className="section-title">Signups over time</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <BarChart data={overview.signups}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
                  <Bar dataKey="value" fill="#1668e3" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="card overflow-x-auto p-4">
          <input className="input mb-3 max-w-sm" placeholder="Search users" value={q} onChange={(e) => { setQ(e.target.value); loadUsers(e.target.value); }} />
          <table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-slate-500"><th className="p-2">Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="p-2 font-semibold">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="input w-32" value={u.role} onChange={(e) => patchUser(u._id, { role: e.target.value })}>
                      {["candidate", "employer", "admin"].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td>{u.banned ? <span className="chip bg-rose-100 text-rose-700">banned</span> : <span className="chip bg-emerald-100 text-emerald-700">active</span>}</td>
                  <td className="space-x-2 py-2 text-right">
                    <button className="btn-ghost" onClick={() => patchUser(u._id, { banned: !u.banned })}>{u.banned ? "Unban" : "Ban"}</button>
                    <button className="btn-danger" onClick={() => delUser(u._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "jobs" && (
        <div className="card overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-slate-500"><th className="p-2">Title</th><th>Company</th><th>Posted by</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id} className="border-t border-slate-100">
                  <td className="p-2 font-semibold">{j.title}</td><td>{j.company}</td>
                  <td>{j.employer?.name}</td><td className="capitalize">{j.status}</td>
                  <td className="py-2 text-right"><button className="btn-danger" onClick={() => delJob(j._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
