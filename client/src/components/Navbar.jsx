import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Briefcase, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/jobs", label: "Jobs" },
    ...(user ? [{ to: "/dashboard", label: "Dashboard" }] : []),
    ...(user?.role === "candidate" ? [
      { to: "/applications", label: "Applications" },
      { to: "/resumes", label: "Resumes" },
      { to: "/ats", label: "ATS Check" },
      { to: "/interview", label: "Interview Prep" },
    ] : []),
    ...(user?.role === "employer" ? [{ to: "/employer/jobs", label: "My Postings" }] : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }, { to: "/employer/jobs", label: "Postings" }] : []),
  ];

  const cls = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-brand-700"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"><Briefcase size={17} /></span>
          CareerForge
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} className={cls}>{l.label}</NavLink>)}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/profile" className="text-sm font-semibold text-slate-700">{user.name}</Link>
              <span className="chip capitalize">{user.role}</span>
              <button className="btn-ghost" onClick={() => { logout(); navigate("/"); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="block py-2 text-sm" onClick={() => setOpen(false)}>{l.label}</NavLink>
          ))}
          {user ? (
            <button className="py-2 text-sm text-rose-600" onClick={() => { logout(); setOpen(false); navigate("/"); }}>Logout</button>
          ) : (
            <Link to="/login" className="block py-2 text-sm" onClick={() => setOpen(false)}>Log in</Link>
          )}
        </div>
      )}
    </header>
  );
}
