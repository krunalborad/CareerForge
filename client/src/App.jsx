import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Applications from "./pages/Applications.jsx";
import EmployerJobs from "./pages/EmployerJobs.jsx";
import JobForm from "./pages/JobForm.jsx";
import JobApplicants from "./pages/JobApplicants.jsx";
import ResumeList from "./pages/ResumeList.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import AtsChecker from "./pages/AtsChecker.jsx";
import InterviewSetup from "./pages/InterviewSetup.jsx";
import InterviewRoom from "./pages/InterviewRoom.jsx";
import InterviewHistory from "./pages/InterviewHistory.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/resumes" element={<ResumeList />} />
          <Route path="/resumes/:id" element={<ResumeBuilder />} />
          <Route path="/resumes/new" element={<ResumeBuilder />} />
          <Route path="/ats" element={<AtsChecker />} />
          <Route path="/interview" element={<InterviewSetup />} />
          <Route path="/interview/:id" element={<InterviewRoom />} />
          <Route path="/interviews" element={<InterviewHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute roles={["employer", "admin"]} />}>
          <Route path="/employer/jobs" element={<EmployerJobs />} />
          <Route path="/employer/jobs/new" element={<JobForm />} />
          <Route path="/employer/jobs/:id/edit" element={<JobForm />} />
          <Route path="/employer/jobs/:id/applicants" element={<JobApplicants />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
