import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Building2, Clock } from "lucide-react";
import api, { errMsg } from "../api/client.js";
import { Alert, Empty } from "../components/ui.jsx";

const TYPES = ["full-time", "part-time", "internship", "contract"];
const MODES = ["onsite", "remote", "hybrid"];

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const get = (k, d = "") => params.get(k) || d;
  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    if (k !== "page") next.delete("page");
    setParams(next);
  };
  const toggleMulti = (k, v) => {
    const cur = get(k).split(",").filter(Boolean);
    setParam(k, cur.includes(v) ? cur.filter((x) => x !== v).join(",") : [...cur, v].join(","));
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/jobs?${params.toString()}`)
      .then(({ data }) => setData(data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="card h-fit space-y-4 p-4">
        <h2 className="section-title">Filters</h2>
        <div>
          <label className="label">Location</label>
          <input className="input" value={get("location")} onChange={(e) => setParam("location", e.target.value)} placeholder="Any city" />
        </div>
        <div>
          <label className="label">Job type</label>
          {TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 py-1 text-sm capitalize">
              <input type="checkbox" checked={get("type").split(",").includes(t)} onChange={() => toggleMulti("type", t)} />
              {t}
            </label>
          ))}
        </div>
        <div>
          <label className="label">Work mode</label>
          {MODES.map((m) => (
            <label key={m} className="flex items-center gap-2 py-1 text-sm capitalize">
              <input type="checkbox" checked={get("workMode").split(",").includes(m)} onChange={() => toggleMulti("workMode", m)} />
              {m}
            </label>
          ))}
        </div>
        <div>
          <label className="label">Skills (comma separated)</label>
          <input className="input" value={get("skills")} onChange={(e) => setParam("skills", e.target.value)} placeholder="react, node.js" />
        </div>
        <div>
          <label className="label">Min salary (₹/yr): {get("minSalary", "0")}</label>
          <input type="range" min="0" max="3000000" step="100000" className="w-full"
            value={get("minSalary", "0")} onChange={(e) => setParam("minSalary", e.target.value)} />
        </div>
        <div>
          <label className="label">My experience (years)</label>
          <input className="input" type="number" min="0" value={get("experience")} onChange={(e) => setParam("experience", e.target.value)} />
        </div>
        <button className="btn-ghost w-full" onClick={() => setParams({})}>Reset filters</button>
      </aside>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="input" placeholder="Search roles, companies, keywords" value={get("q")} onChange={(e) => setParam("q", e.target.value)} />
          <select className="input sm:w-44" value={get("sort", "recent")} onChange={(e) => setParam("sort", e.target.value)}>
            <option value="recent">Most recent</option>
            <option value="salary">Highest salary</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        <Alert>{error}</Alert>
        <p className="text-sm text-slate-500">{loading ? "Searching…" : `${data.total} job${data.total === 1 ? "" : "s"} found`}</p>

        {!loading && !data.items.length && <Empty title="No jobs match those filters">Try widening your search.</Empty>}

        {data.items.map((job) => (
          <Link key={job._id} to={`/jobs/${job._id}`} className="card block p-5 transition hover:border-brand-300">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-ink">{job.title}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><Building2 size={14} />{job.company}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} />{job.type}</span>
                </p>
              </div>
              <span className="text-sm font-semibold text-brand-700">
                {job.type === "internship"
                  ? job.stipend ? `₹${job.stipend.toLocaleString()}/mo` : "Stipend TBD"
                  : job.salaryMin ? `₹${(job.salaryMin / 100000).toFixed(1)}–${(job.salaryMax / 100000).toFixed(1)} LPA` : "Not disclosed"}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills?.slice(0, 6).map((s) => <span key={s} className="chip capitalize">{s}</span>)}
            </div>
          </Link>
        ))}

        {data.pages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setParam("page", String(p))}
                className={`h-9 w-9 rounded-lg text-sm font-semibold ${String(p) === get("page", "1") ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
