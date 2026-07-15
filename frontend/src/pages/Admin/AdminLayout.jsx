import React from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Activity, BarChart2, Building2, Network } from 'lucide-react';

const tabs = [
  { label: 'Company Profile', path: '/admin/company', icon: Building2 },
  { label: 'Org Chart', path: '/admin/org-chart', icon: Network },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { label: 'Activity Log', path: '/admin/activity', icon: Activity },
];

const AdminLayout = () => {
  const location = useLocation();

  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/company" replace />;
  }

  return (
    <div className="flex min-h-full flex-col overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-secondary-900/70">
      <div className="border-b border-secondary-100 px-4 dark:border-white/10 sm:px-6">
        <nav className="flex gap-2 overflow-x-auto py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  [
                    'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-body-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
                      : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-800 dark:text-secondary-300 dark:hover:bg-white/10 dark:hover:text-white',
                  ].join(' ')
                }
              >
                <Icon size={16} strokeWidth={1.75} />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
