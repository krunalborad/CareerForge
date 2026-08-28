import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { errMsg } from "../api/client.js";
import { Alert } from "../components/ui.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "candidate", company: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <Alert>{error}</Alert>
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password (min 6 characters)</label>
            <input className="input" type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">I am a</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="candidate">Candidate / Student</option>
              <option value="employer">Employer / Recruiter</option>
            </select>
          </div>
          {form.role === "employer" && (
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          )}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Sign up"}</button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already registered? <Link to="/login" className="font-semibold text-brand-700">Log in</Link>
        </p>
      </div>
    </div>
  );
}
