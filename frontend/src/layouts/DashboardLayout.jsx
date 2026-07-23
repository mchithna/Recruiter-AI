import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Sun,
  Building2,
  Network,
  BarChart2,
  ClipboardList,
  FileText,
  FileCheck,
  User,
  UserCheck,
  Video,
  X
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Avatar, Button, Tooltip } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ChatBot from '../components/chat/ChatBot';
import NotificationBell from '../components/notifications/NotificationBell';

const navItemsByRole = {
  Recruiter: [
    { name: 'Home', path: '/recruiter/home', icon: Home },
    { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { name: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
    { name: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
    { name: 'Notifications', path: '/recruiter/notifications', icon: Bell },
  ],
  Admin: [
    { name: 'Company Profile', path: '/admin/company', icon: Building2 },
    { name: 'Org Chart', path: '/admin/org-chart', icon: Network },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Activity Log', path: '/admin/activity', icon: ClipboardList },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  ],
  Candidate: [
    { name: 'Home', path: '/candidate/home', icon: Home },
    { name: 'Profile', path: '/candidate/profile', icon: User },
    { name: 'Documents', path: '/candidate/documents', icon: FileText },
    { name: 'Jobs', path: '/candidate/jobs', icon: Briefcase },
    { name: 'Applications', path: '/candidate/applications', icon: ClipboardList },
    { name: 'Meetings', path: '/candidate/meetings', icon: Video },
    { name: 'Notifications', path: '/candidate/notifications', icon: Bell },
  ],
  HiringManager: [
    { name: 'Home', path: '/hiring-manager/home', icon: Home },
    { name: 'Jobs', path: '/hiring-manager/jobs', icon: Briefcase },
    { name: 'Interviews', path: '/hiring-manager/interviews', icon: Calendar },
    { name: 'Offers', path: '/hiring-manager/offers', icon: FileCheck },
    { name: 'Notifications', path: '/hiring-manager/notifications', icon: Bell },
  ],
  Guest: [
    { name: 'Overview', path: '/dashboard', icon: Home },
  ]
};

export default function DashboardLayout() {
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const prevPathRef = useRef(location.pathname);
  const savedCollapseState = useRef(false);
  const isLiveCopilotRoute = location.pathname.includes('/live-copilot');

  useEffect(() => {
    setMobileOpen(false);
    
    const isNowCopilot = location.pathname.includes('/live-copilot');
    const wasCopilot = prevPathRef.current.includes('/live-copilot');

    if (isNowCopilot && !wasCopilot) {
      setIsCollapsed((current) => {
        savedCollapseState.current = current;
        return true;
      });
    } else if (!isNowCopilot && wasCopilot) {
      setIsCollapsed(savedCollapseState.current);
    }
    
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const role = profile?.role || 'Guest';
  const navItems = navItemsByRole[role] || navItemsByRole.Guest;
  const profileName = `${profile?.firstName || role} ${profile?.lastName || ''}`.trim();
  const profilePathByRole = {
    Candidate: '/candidate/profile',
    Admin: '/admin/company',
    Recruiter: '/recruiter/home',
    HiringManager: '/hiring-manager/home',
  };
  const profilePath = profilePathByRole[role] || '/dashboard';

  return (
    <div className="recruiter-shell relative flex h-[100dvh] overflow-hidden text-secondary-900 dark:text-white">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-secondary-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-white/60 bg-white/80 shadow-glass backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-secondary-950/70 dark:shadow-glass-dark md:relative md:z-10 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'md:w-20' : 'md:w-72',
          'w-72',
        ].join(' ')}
      >
        <div className="relative flex h-24 shrink-0 items-center overflow-hidden border-b border-secondary-100 p-4 dark:border-white/10">
          <img
            src="/images/card-bg-ai-matching.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply dark:opacity-40 dark:mix-blend-screen"
          />
          <div className="relative flex min-w-0 flex-1 items-center gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-ai-600 text-h4 text-white shadow-glow-primary">
              H
            </div>
            <div className={['min-w-0 transition-opacity duration-200', isCollapsed ? 'md:hidden' : ''].join(' ')}>
              <h2 className="text-h3 text-secondary-900 dark:text-white">Hirely</h2>
              <p className="text-body-sm text-secondary-500 dark:text-secondary-400">
                {role} command center
              </p>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-secondary-600 dark:bg-white/10 dark:text-white md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={[
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-semibold',
                  'transition-all duration-base hover:-translate-y-0.5',
                  isCollapsed ? 'md:justify-center md:px-2' : '',
                  isActive
                    ? 'bg-white text-primary-700 shadow-glow-primary dark:bg-white/10 dark:text-primary-300'
                    : 'text-secondary-600 hover:bg-white/70 hover:text-primary-700 dark:text-secondary-300 dark:hover:bg-white/10 dark:hover:text-white',
                ].join(' ')}
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
                <span className={isCollapsed ? 'md:hidden' : ''}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-secondary-100 p-4 dark:border-white/10 md:block">
          <Tooltip content={isLiveCopilotRoute ? 'Sidebar locked in copilot mode' : (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}>
            <Button
              type="button"
              variant="glass"
              size="sm"
              className="w-full justify-center"
              leftIcon={isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              onClick={() => setIsCollapsed((value) => !value)}
              disabled={isLiveCopilotRoute}
            >
              <span className={isCollapsed ? 'md:hidden' : ''}>
                {isCollapsed ? 'Expand' : 'Collapse'}
              </span>
            </Button>
          </Tooltip>
        </div>
      </aside>

      <main className="relative z-10 flex h-screen flex-1 flex-col overflow-hidden">
        <header className="relative z-50 flex h-auto min-h-16 shrink-0 items-center justify-between gap-3 border-b border-white/60 bg-white/65 px-3 py-2 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/45 sm:h-20 sm:px-6 sm:py-0 lg:px-8">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                aria-label="Open sidebar"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/70 text-secondary-700 shadow-sm dark:bg-white/10 dark:text-white md:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={14} strokeWidth={2} />
              </button>
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase leading-none tracking-wide text-secondary-400 sm:text-caption">
                  {role} dashboard
                </p>
                <h1 className="mt-1 truncate text-[11px] font-bold leading-none text-secondary-900 dark:text-white sm:text-h3">
                  Welcome, {profile?.firstName || role}!
                </h1>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <NotificationBell />
            <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <Button
                type="button"
                variant="glass"
                size="sm"
                className="h-7 w-7 rounded-lg px-0 [&>span:first-child]:m-0 [&>span:nth-child(2)]:hidden sm:h-8 sm:w-auto sm:rounded-button sm:px-3 sm:[&>span:nth-child(2)]:inline-flex"
                leftIcon={
                  theme === 'dark'
                    ? <Sun size={13} strokeWidth={2} />
                    : <Moon size={13} strokeWidth={2} />
                }
                onClick={toggleTheme}
              >
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </Button>
            </Tooltip>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 rounded-lg px-0 [&>span:first-child]:m-0 [&>span:nth-child(2)]:hidden sm:h-8 sm:w-auto sm:rounded-button sm:px-3 sm:[&>span:nth-child(2)]:inline-flex"
              leftIcon={<LogOut size={13} strokeWidth={2} />}
              onClick={handleSignOut}
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <Tooltip content="Open profile">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400 sm:h-8 sm:w-8"
                onClick={() => navigate(profilePath)}
                aria-label="Open profile"
              >
                <Avatar name={profileName} src={profile?.profilePictureUrl} size="sm" />
              </button>
            </Tooltip>
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto px-4 pb-28 pt-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:pr-12">
          <Outlet />
        </div>
      </main>
      {role !== 'Guest' && <ChatBot />}
    </div>
  );
}
