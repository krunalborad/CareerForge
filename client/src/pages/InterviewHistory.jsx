import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api/client.js";
import { Alert, Empty } from "../components/ui.jsx";

export default function InterviewHistory() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = () => api.get("/interviews").then(({ data }) => setItems(data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const remove = async (id) => { if (confirm("Delete this session?")) { await api.delete(`/interviews/${id}`); load(); } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Interview history</h1>
        <Link to="/interview" className="btn-primary">New session</Link>
      </div>
      <Alert>{error}</Alert>
      {!items.length && <Empty title="No sessions yet">Run your first mock interview to start tracking progress.</Empty>}
      {items.map((i) => (
        <div key={i._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-bold">{i.role} · <span className="capitalize font-normal text-slate-600">{i.level}</span></p>
            <p className="text-xs text-slate-500">
              {new Date(i.createdAt).toLocaleString()} · {i.answers.length}/{i.questions.length} answered · {i.status}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-brand-700">{i.overallScore}</span>
            <Link className="btn-ghost" to={`/interview/${i._id}`}>Open</Link>
            <button className="btn-danger" onClick={() => remove(i._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
