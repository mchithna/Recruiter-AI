import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AdminDashboard from './pages/admin/Dashboard';

// Dummy components
const CandidateDashboard = () => {
  const { profile } = useAuth();
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-2">Welcome, {profile?.firstName} {profile?.lastName}!</h2>
      <p className="text-slate-500 dark:text-slate-400">This is your blank candidate dashboard.</p>
    </div>
  );
};

const RecruiterDashboard = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h2 className="text-xl font-bold mb-2">Recruiter Dashboard</h2>
    <p className="text-slate-500 dark:text-slate-400">Manage candidates and job postings.</p>
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

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<div className="text-xl font-medium">Welcome to the Dashboard!</div>} />

              {/* Role-specific routes using ProtectedRoute allowedRoles feature */}
              <Route element={<ProtectedRoute allowedRoles={['Candidate']} />}>
                <Route path="/candidate" element={<CandidateDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Recruiter']} />}>
                <Route path="/recruiter" element={<RecruiterDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
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
