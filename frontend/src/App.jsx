import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import AdminLayout from './pages/Admin/AdminLayout';
import CompanyProfile from './pages/Admin/CompanyProfile';
import OrgChartBuilder from './pages/Admin/OrgChartBuilder';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminActivityLog from './pages/Admin/AdminActivityLog';
import RecruiterRoutes, { RecruiterIndexRedirect } from './pages/Recruiter/RecruiterRoutes';
import JobsList from './pages/Recruiter/JobsList';
import JobForm from './pages/Recruiter/JobForm';
import JobApplicationsList from './pages/Recruiter/JobApplicationsList';
import ApplicationDetail from './pages/Recruiter/ApplicationDetail';
import InterviewsList from './pages/Recruiter/InterviewsList';
import RecruiterHome from './pages/Recruiter/RecruiterHome';
import MessagesList from './pages/Recruiter/MessagesList';
import CandidateDashboardPage from './pages/candidate/Dashboard';
import HiringManagerDashboard from './pages/HiringManagerDashboard';

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
              <Route element={<ProtectedRoute allowedRoles={['Candidate']} />}>
                <Route path="/candidate" element={<CandidateDashboardPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/company" replace />} />
                  <Route path="company" element={<CompanyProfile />} />
                  <Route path="org-chart" element={<OrgChartBuilder />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="activity" element={<AdminActivityLog />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['HiringManager']} />}>
                <Route path="/hiring-manager" element={<HiringManagerDashboard />} />
              </Route>
            </Route>

          </Route>

          {/* Recruiter-specific Layout */}
          <Route element={<ProtectedRoute allowedRoles={['Recruiter']} />}>
            <Route element={<DashboardLayout />}>
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

          {/* Dev-only: design system showcase — no auth required */}
          <Route path="/style-guide" element={<StyleGuide />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
