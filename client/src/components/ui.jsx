export function StatCard({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ScoreRing({ score = 0, size = 96, label = "Score" }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <div
      className="grid place-items-center rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0deg)` }}
    >
      <div className="grid place-items-center rounded-full bg-white" style={{ width: size - 18, height: size - 18 }}>
        <span className="text-xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      </div>
    </div>
  );
}

export function Alert({ type = "error", children }) {
  if (!children) return null;
  const styles = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-brand-100 bg-brand-50 text-brand-700",
  };
  return <div className={`rounded-lg border px-3 py-2 text-sm ${styles[type]}`}>{children}</div>;
}

export function Empty({ title, children }) {
  return (
    <div className="card grid place-items-center p-10 text-center">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{children}</p>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    applied: "bg-slate-100 text-slate-700",
    shortlisted: "bg-amber-100 text-amber-800",
    interview: "bg-brand-100 text-brand-700",
    rejected: "bg-rose-100 text-rose-700",
    hired: "bg-emerald-100 text-emerald-700",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status] || map.applied}`}>{status}</span>;
}
