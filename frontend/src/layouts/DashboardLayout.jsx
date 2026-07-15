import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  BarChart2,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  Sun,
  Building2,
  Network
} from 'lucide-react';
import { Avatar, Button, Tooltip } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getProfileRole, ROLE } from '../lib/roles';

const navItemsByRole = {
  Recruiter: [
    { name: 'Home', path: '/recruiter/home', icon: Home },
    { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { name: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
    { name: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
  ],
  Admin: [
    { name: 'Company Profile', path: '/admin/company', icon: Building2 },
    { name: 'Org Chart', path: '/admin/org-chart', icon: Network },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Activity Log', path: '/admin/activity', icon: ClipboardList },
  ],
  Candidate: [
    { name: 'Dashboard', path: '/candidate', icon: Home },
  ],
  HiringManager: [
    { name: 'Dashboard', path: '/hiring-manager', icon: Home },
  ],
  Guest: [
    { name: 'Overview', path: '/dashboard', icon: Home },
  ]
};

export default function DashboardLayout() {
  const { signOut, profile, session } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const role = getProfileRole(profile, session) || 'Guest';
  const navItems = navItemsByRole[role] || navItemsByRole.Guest;
  const profileName = `${profile?.firstName || role} ${profile?.lastName || ''}`.trim();
  const roleLabel = role === ROLE.HIRING_MANAGER ? 'Hiring Manager' : role;

  return (
    <div className="recruiter-shell relative flex min-h-screen overflow-hidden bg-secondary-50 text-secondary-900 dark:bg-secondary-950 dark:text-white">
      <aside
        className={[
          'relative z-10 flex shrink-0 flex-col border-r border-white/60 bg-white/80 shadow-glass backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-secondary-950/70 dark:shadow-glass-dark',
          isSidebarCollapsed ? 'w-20' : 'w-72',
        ].join(' ')}
      >
        <div className={['relative shrink-0 overflow-hidden border-b border-secondary-100 dark:border-white/10', isSidebarCollapsed ? 'p-4' : 'p-6'].join(' ')}>
          <img
            src="/images/card-bg-ai-matching.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply dark:opacity-40 dark:mix-blend-screen"
          />
          <div className="relative">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-ai-600 text-h4 text-white shadow-glow-primary">
              H
            </div>
            {!isSidebarCollapsed && (
              <>
                <h2 className="mt-4 text-h2 text-secondary-900 dark:text-white">Hirely</h2>
                <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
                  {roleLabel} command center
                </p>
              </>
            )}
          </div>
        </div>

        <div className="border-b border-secondary-100 p-3 dark:border-white/10">
          <Tooltip content={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={['w-full rounded-xl', isSidebarCollapsed ? 'px-0' : 'justify-start'].join(' ')}
              leftIcon={
                isSidebarCollapsed
                  ? <PanelLeftOpen size={18} strokeWidth={1.75} />
                  : <PanelLeftClose size={18} strokeWidth={1.75} />
              }
              onClick={() => setIsSidebarCollapsed((value) => !value)}
            >
              <span className={isSidebarCollapsed ? 'sr-only' : ''}>
                {isSidebarCollapsed ? 'Expand' : 'Collapse'}
              </span>
            </Button>
          </Tooltip>
        </div>

        <nav className={['flex-1 space-y-1 overflow-y-auto', isSidebarCollapsed ? 'p-3' : 'p-4'].join(' ')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            const link = (
              <Link
                key={item.name}
                to={item.path}
                className={[
                  'group flex items-center rounded-xl text-body-sm font-semibold',
                  'transition-all duration-base hover:-translate-y-0.5',
                  isSidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-white text-primary-700 shadow-glow-primary dark:bg-white/10 dark:text-primary-300'
                    : 'text-secondary-600 hover:bg-white/70 hover:text-primary-700 dark:text-secondary-300 dark:hover:bg-white/10 dark:hover:text-white',
                ].join(' ')}
                aria-label={item.name}
              >
                <span
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300'
                      : 'bg-secondary-100 text-secondary-500 group-hover:bg-primary-100 group-hover:text-primary-700 dark:bg-white/5 dark:text-secondary-300',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );

            return isSidebarCollapsed ? (
              <Tooltip key={item.name} content={item.name}>
                {link}
              </Tooltip>
            ) : link;
          })}
        </nav>
      </aside>

      <main className="relative z-10 flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/60 bg-white/75 px-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55">
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
              {roleLabel} dashboard
            </p>
            <h1 className="text-h3 text-secondary-900 dark:text-white">
              Welcome, {profile?.firstName || roleLabel}!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <Button
                type="button"
                variant="glass"
                size="sm"
                leftIcon={
                  theme === 'dark'
                    ? <Sun size={16} strokeWidth={1.75} />
                    : <Moon size={16} strokeWidth={1.75} />
                }
                onClick={toggleTheme}
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </Tooltip>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<LogOut size={16} strokeWidth={1.75} />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
            <Avatar name={profileName} size="sm" />
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
