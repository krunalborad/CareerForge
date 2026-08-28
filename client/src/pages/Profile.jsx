import { useState } from "react";
import api, { errMsg } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert } from "../components/ui.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name, headline: user.headline || "", location: user.location || "",
    skills: (user.skills || []).join(", "), experienceYears: user.experienceYears || 0, company: user.company || "",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/me", {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears) || 0,
      });
      updateUser(data.user);
      setMsg({ type: "success", text: "Profile updated." });
    } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };

  return (
    <form className="card mx-auto max-w-xl space-y-4 p-6" onSubmit={save}>
      <h1 className="text-2xl font-extrabold">My profile</h1>
      {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}
      <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><label className="label">Headline</label><input className="input" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
      <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      <div><label className="label">Skills (comma separated)</label><input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
      <div><label className="label">Experience (years)</label><input className="input" type="number" min="0" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /></div>
      {user.role === "employer" && <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>}
      <button className="btn-primary">Save profile</button>
    </form>
  );
}
