import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestLayout from './layouts/GuestLayout';
import DashboardLayout from './layouts/DashboardLayout';
import StyleGuide from './pages/StyleGuide';
<<<<<<< HEAD
import Home from './pages/Home/index'; // DEV PREVIEW ONLY
=======
import Login from './pages/Login';
import RegisterCandidate from './pages/RegisterCandidate';
import RegisterCompany from './pages/RegisterCompany';
import AcceptInvite from './pages/AcceptInvite';
>>>>>>> origin/minal

// Dummy components
const CandidateDashboard = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h2 className="text-xl font-bold mb-2">Candidate Dashboard</h2>
    <p className="text-slate-500">View your applications and profile here.</p>
  </div>
);

const RecruiterDashboard = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h2 className="text-xl font-bold mb-2">Recruiter Dashboard</h2>
    <p className="text-slate-500">Manage candidates and job postings.</p>
  </div>
);

const AdminDashboard = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h2 className="text-xl font-bold mb-2">Admin Dashboard</h2>
    <p className="text-slate-500">Platform overview and settings.</p>
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
          {/* Guest Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register/candidate" element={<RegisterCandidate />} />
          <Route path="/register/company" element={<RegisterCompany />} />
          <Route path="/invite/accept" element={<AcceptInvite />} />
        </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<div className="text-xl font-medium">Welcome to the Dashboard!</div>} />
              
              {/* Role-specific routes using ProtectedRoute allowedRoles feature */}
              <Route element={<ProtectedRoute allowedRoles={['Candidate', 'Admin']} />}>
                <Route path="/candidate" element={<CandidateDashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['Recruiter', 'Admin']} />}>
                <Route path="/recruiter" element={<RecruiterDashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Route>
          
          {/* Fallback routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />

<<<<<<< HEAD
        {/* Dev-only: design system showcase — no auth required */}
        <Route path="/style-guide" element={<StyleGuide />} />
        {/* DEV PREVIEW — remove before final merge */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
=======
          {/* Dev-only: design system showcase — no auth required */}
          <Route path="/style-guide" element={<StyleGuide />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
>>>>>>> origin/minal
  );
}

export default App;
