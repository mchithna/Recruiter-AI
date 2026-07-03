import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import GuestLayout from './layouts/GuestLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Dummy components
const Login = () => (
  <div className="text-center">
    <h2 className="text-2xl font-bold mb-4">Welcome Back</h2>
    <p className="text-slate-500 mb-8">Please login to continue.</p>
    <div className="p-4 bg-indigo-50 text-indigo-700 rounded-lg">Login Form Placeholder</div>
  </div>
);

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
    <BrowserRouter>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
          {/* add /register here later */}
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<div className="text-xl font-medium">Welcome to the Dashboard!</div>} />
            
            {/* Role-specific routes using ProtectedRoute allowedRoles feature */}
            <Route element={<ProtectedRoute allowedRoles={['candidate', 'admin', 'user']} />}>
              <Route path="/candidate" element={<CandidateDashboard />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
              <Route path="/recruiter" element={<RecruiterDashboard />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>
        
        {/* Fallback routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
