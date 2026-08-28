import { Link } from "react-router-dom";
import { Search, FileText, Mic, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const features = [
  { icon: Search, title: "Job & internship search", text: "Filter by skills, location, work mode, stipend and experience — LinkedIn breadth with Internshala focus." },
  { icon: FileText, title: "AI resume builder", text: "Four templates, drag-to-reorder sections, AI-written bullets, ATS scoring and one-click PDF export." },
  { icon: Mic, title: "AI interview prep", text: "Role-specific questions, voice-recorded answers with live transcription, and instant scored feedback." },
  { icon: BarChart3, title: "Analytics dashboards", text: "Track applications, match scores, interview trends and skill gaps for candidates and employers." },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <span className="chip bg-brand-50 text-brand-700">MERN · AI powered</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-ink md:text-5xl">
            Find the job, build the resume, ace the interview.
          </h1>
          <p className="mt-4 text-slate-600">
            CareerForge combines a full job portal, an AI resume builder with ATS checking, and a voice-driven
            interview coach in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/jobs" className="btn-primary">Browse jobs</Link>
            <Link to={user ? "/resumes" : "/register"} className="btn-ghost">
              {user ? "Open resume builder" : "Create free account"}
            </Link>
          </div>
        </div>
        <div className="card p-6">
          <p className="text-sm font-semibold text-slate-500">Demo accounts (after running the seed script)</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-lg bg-slate-50 p-3">candidate@careerforge.dev · candidate123</li>
            <li className="rounded-lg bg-slate-50 p-3">employer@careerforge.dev · employer123</li>
            <li className="rounded-lg bg-slate-50 p-3">admin@careerforge.dev · admin123</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="card p-5">
            <f.icon className="text-brand-600" />
            <h3 className="mt-3 font-bold text-ink">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
