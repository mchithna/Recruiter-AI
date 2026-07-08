import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

const DashboardLayout = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 shadow-md border-r border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Hirely
          </h2>
        </div>
        <nav className="p-4 space-y-1">
          <Link to="/" className="block py-2.5 px-4 rounded-lg font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400 transition-colors">
            Overview
          </Link>
          
          {profile?.role === 'Candidate' && (
            <Link to="/candidate" className="block py-2.5 px-4 rounded-lg font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400 transition-colors">
              Candidate Dashboard
            </Link>
          )}
          
          {profile?.role === 'Recruiter' && (
            <Link to="/recruiter" className="block py-2.5 px-4 rounded-lg font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400 transition-colors">
              Recruiter Dashboard
            </Link>
          )}
          
          {profile?.role === 'Admin' && (
            <Link to="/admin" className="block py-2.5 px-4 rounded-lg font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400 transition-colors">
              Admin Dashboard
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Placeholder */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-end px-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
              U
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
