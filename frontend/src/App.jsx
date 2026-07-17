import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestLayout from './layouts/GuestLayout';
import DashboardLayout from './layouts/DashboardLayout';
import StyleGuide from './pages/StyleGuide';
import Home from './pages/Home/index';
import Login from './pages/Login';
import RegisterCandidate from './pages/RegisterCandidate';
import RegisterCompany from './pages/RegisterCompany';
import AcceptInvite from './pages/AcceptInvite';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import CompanyProfile from './pages/Admin/CompanyProfile';
import OrgChartBuilder from './pages/Admin/OrgChartBuilder';
import Analytics from './pages/Admin/Analytics';
import ActivityLog from './pages/Admin/ActivityLog';
import RecruiterRoutes, { RecruiterIndexRedirect } from './pages/Recruiter/RecruiterRoutes';
import JobsList from './pages/Recruiter/JobsList';
import JobForm from './pages/Recruiter/JobForm';
import JobApplicationsList from './pages/Recruiter/JobApplicationsList';
import ApplicationDetail from './pages/Recruiter/ApplicationDetail';
import InterviewsList from './pages/Recruiter/InterviewsList';
import RecruiterHome from './pages/Recruiter/RecruiterHome';
import MessagesList from './pages/Recruiter/MessagesList';

import CandidateHome from './pages/candidate/Home';
import Profile from './pages/candidate/Profile';
import Documents from './pages/candidate/Documents';
import Jobs from './pages/candidate/JobSearch';
import JobDetail from './pages/candidate/JobDetail';
import Applications from './pages/candidate/Applications';
import CandidateApplicationDetail from './pages/candidate/ApplicationDetail';

// Dummy components
const HiringManagerDashboard = () => (
  <div className="bg-white/60 dark:bg-secondary-900/40 p-6 rounded-2xl shadow-glass border border-white/60 dark:border-white/10">
    <h2 className="text-xl font-bold mb-2 text-secondary-900 dark:text-white">Hiring Manager Dashboard</h2>
    <p className="text-secondary-500 dark:text-secondary-400">Review candidates and manage hiring pipelines.</p>
  </div>
);

const RecruiterDashboard = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h2 className="text-xl font-bold mb-2">Recruiter Dashboard</h2>
    <p className="text-slate-500 dark:text-slate-400">Manage candidates and job postings.</p>
  </div>
);


const AdminDashboard = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h2 className="text-xl font-bold mb-2">Admin Dashboard</h2>
    <p className="text-slate-500 dark:text-slate-400">Platform overview and settings.</p>
  </div>
);

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-4xl font-bold text-red-500 mb-2">403</h2>
    <p className="text-xl text-slate-700 dark:text-slate-300">Unauthorized Access</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages — Home + marketing */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Guest Routes (auth forms) */}
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register/candidate" element={<RegisterCandidate />} />
            <Route path="/register/company" element={<RegisterCompany />} />
            <Route path="/invite/accept" element={<AcceptInvite />} />
          </Route>

          {/* Dashboard Layout (Shared shell) */}
          <Route element={<DashboardLayout />}>

            {/* Protected Routes inside Dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div className="text-xl font-medium">Welcome to the Dashboard!</div>} />

              {/* Role-specific routes using ProtectedRoute allowedRoles feature */}
              <Route element={<ProtectedRoute allowedRoles={['HiringManager']} />}>
                <Route path="/hiring-manager" element={<HiringManagerDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Candidate']} />}>
                <Route path="/candidate" element={<Navigate to="/candidate/home" replace />} />
                <Route path="/candidate/home" element={<CandidateHome />} />
                <Route path="/candidate/profile" element={<Profile />} />
                <Route path="/candidate/documents" element={<Documents />} />
                <Route path="/candidate/jobs" element={<Jobs />} />
                <Route path="/candidate/jobs/:jobId" element={<JobDetail />} />
                <Route path="/candidate/applications" element={<Applications />} />
                <Route path="/candidate/applications/:applicationId" element={<CandidateApplicationDetail />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin" element={<Navigate to="/admin/company" replace />} />
                <Route path="/admin/company" element={<CompanyProfile />} />
                <Route path="/admin/org-chart" element={<OrgChartBuilder />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/activity" element={<ActivityLog />} />
              </Route>
            </Route>

            {/* Recruiter-specific Layout */}
            <Route element={<ProtectedRoute allowedRoles={['Recruiter']} />}>
              <Route path="/recruiter" element={<RecruiterRoutes />}>
                <Route index element={<RecruiterIndexRedirect />} />
                <Route path="home" element={<RecruiterHome />} />
                <Route path="jobs" element={<JobsList />} />
                <Route path="jobs/new" element={<JobForm />} />
                <Route path="jobs/:jobId/edit" element={<JobForm />} />
                <Route path="jobs/:jobId/applications" element={<JobApplicationsList />} />
                <Route path="applications/:applicationId" element={<ApplicationDetail />} />
                <Route path="interviews" element={<InterviewsList />} />
                <Route path="messages" element={<MessagesList />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/style-guide" element={<StyleGuide />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;