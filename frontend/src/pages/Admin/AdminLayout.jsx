import React from 'react';
import { Outlet, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import { LogOut } from 'lucide-react';

const AdminLayout = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/org-chart" replace />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Header with Greeting and Logout */}
      <div className="bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome, {profile?.firstName || 'Admin'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage your company's settings and organization.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          Log Out
        </Button>
      </div>

      {/* Top Tabs Navigation */}
      <div className="bg-white dark:bg-slate-800 px-6 border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-6">
          <NavLink
            to="/admin/company"
            className={({ isActive }) =>
              `py-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
              }`
            }
          >
            Company Profile
          </NavLink>
          <NavLink
            to="/admin/org-chart"
            className={({ isActive }) =>
              `py-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
              }`
            }
          >
            Org Chart
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
