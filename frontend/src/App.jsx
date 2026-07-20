import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import HiringManagerRoutes, { HiringManagerIndexRedirect } from './pages/HiringManager/HiringManagerRoutes';
import HiringManagerHome from './pages/HiringManager/Home';
import Queue from './pages/HiringManager/Queue';
import HiringManagerApplicationDetail from './pages/HiringManager/ApplicationDetail';
import HiringManagerInterviews from './pages/HiringManager/Interviews';
import HiringManagerInterviewDetail from './pages/HiringManager/InterviewDetail';
import HiringManagerEvaluate from './pages/HiringManager/Evaluate';
import HiringManagerOffer from './pages/HiringManager/Offer';
import HiringManagerOffers from './pages/HiringManager/Offers';
import ChatBot from './components/chat/ChatBot';
import CandidateHome from './pages/candidate/Home';
import Profile from './pages/candidate/Profile';
import Documents from './pages/candidate/Documents';
import Jobs from './pages/candidate/JobSearch';
import JobDetail from './pages/candidate/JobDetail';
import Applications from './pages/candidate/Applications';
import CandidateApplicationDetail from './pages/candidate/ApplicationDetail';

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-4xl font-bold text-red-500 mb-2">403</h2>
    <p className="text-xl text-slate-700 dark:text-slate-300">Unauthorized Access</p>
  </div>
);

const PublicChatBotMount = () => {
  const location = useLocation();
  const path = location.pathname || '/';
  const isDashboardPath =
    path.startsWith('/candidate')
    || path.startsWith('/recruiter')
    || path.startsWith('/admin')
    || path.startsWith('/hiring-manager')
    || path.startsWith('/dashboard');

  return isDashboardPath ? null : <ChatBot />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route element={<GuestLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register/candidate" element={<RegisterCandidate />} />
            <Route path="/register/company" element={<RegisterCompany />} />
            <Route path="/invite/accept" element={<AcceptInvite />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div className="text-xl font-medium">Welcome to the Dashboard!</div>} />

              <Route element={<ProtectedRoute allowedRoles={['HiringManager']} />}>
                <Route path="/hiring-manager" element={<HiringManagerRoutes />}>
                  <Route index element={<HiringManagerIndexRedirect />} />
                  <Route path="home" element={<HiringManagerHome />} />
                  <Route path="queue" element={<Queue />} />
                  <Route path="applications/:applicationId" element={<HiringManagerApplicationDetail />} />
                  <Route path="interviews" element={<HiringManagerInterviews />} />
                  <Route path="interviews/:interviewId" element={<HiringManagerInterviewDetail />} />
                  <Route path="interviews/:interviewId/evaluate" element={<HiringManagerEvaluate />} />
                  <Route path="applications/:applicationId/offer" element={<HiringManagerOffer />} />
                  <Route path="offers" element={<HiringManagerOffers />} />
                </Route>
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

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/style-guide" element={<StyleGuide />} />
        </Routes>
        <PublicChatBotMount />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
