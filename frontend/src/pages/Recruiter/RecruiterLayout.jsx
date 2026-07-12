import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LogOut, Home, Briefcase, Calendar, MessageSquare } from 'lucide-react';

const RecruiterLayout = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Home', path: '/recruiter/home', icon: Home },
    { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { name: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
    { name: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 shadow-md border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Hirely
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Recruiter Portal</p>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div>
            <h1 className="text-lg font-semibold">
              Welcome, {profile?.firstName || 'Recruiter'}!
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
              {profile?.firstName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RecruiterLayout;
