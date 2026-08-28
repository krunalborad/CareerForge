import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import api, { errMsg } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatCard, Alert } from "../components/ui.jsx";

const COLORS = ["#1668e3", "#16a34a", "#d97706", "#dc2626", "#7c3aed"];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/analytics/dashboard").then(({ data }) => setData(data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <p className="text-sm text-slate-500">Loading analytics…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Hi {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">Here is how your {data.role === "employer" ? "hiring" : "job hunt"} is going.</p>
        </div>
        {data.role === "employer" ? (
          <Link to="/employer/jobs/new" className="btn-primary">Post a job</Link>
        ) : (
          <div className="flex gap-2">
            <Link to="/interview" className="btn-ghost">Practise interview</Link>
            <Link to="/resumes/new" className="btn-primary">Build resume</Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(data.stats).map(([k, v]) => (
          <StatCard key={k} label={k.replace(/([A-Z])/g, " $1")} value={v} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="section-title">{data.role === "employer" ? "Applications by status" : "My application pipeline"}</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.byStatus.filter((s) => s.value)} dataKey="value" nameKey="name" outerRadius={90} label>
                  {data.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.role === "employer" ? (
          <div className="card p-5">
            <h2 className="section-title">Applicants per posting</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <BarChart data={data.perJob}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
                  <Bar dataKey="applications" fill="#1668e3" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="avgMatch" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="card p-5">
            <h2 className="section-title">Interview score trend</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <LineChart data={data.scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} /><YAxis domain={[0, 100]} fontSize={11} /><Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#1668e3" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {data.role === "candidate" && !!data.skillGaps?.length && (
        <div className="card p-5">
          <h2 className="section-title">Top skill gaps across your applications</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={data.skillGaps} layout="vertical">
                <XAxis type="number" fontSize={11} /><YAxis dataKey="name" type="category" width={110} fontSize={11} />
                <Tooltip /><Bar dataKey="value" fill="#d97706" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
