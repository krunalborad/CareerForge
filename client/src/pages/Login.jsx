import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { errMsg } from "../api/client.js";
import { Alert } from "../components/ui.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await login(form.email, form.password);
      navigate(state?.from || "/dashboard", { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to your CareerForge account.</p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <Alert>{error}</Alert>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Log in"}</button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          No account? <Link to="/register" className="font-semibold text-brand-700">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
