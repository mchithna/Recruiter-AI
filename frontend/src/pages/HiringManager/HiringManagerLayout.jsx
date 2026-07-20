import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  Moon,
  Sparkles,
  Sun,
  Home,
  UserCheck,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { Avatar, Badge, Button, Tooltip } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { name: 'Home', path: '/hiring-manager/home', icon: Home },
  { name: 'Shortlist', path: '/hiring-manager/queue', icon: UserCheck },
  { name: 'Interviews', path: '/hiring-manager/interviews', icon: Calendar },
  { name: 'Offers', path: '/hiring-manager/offers', icon: FileCheck },
];


export default function HiringManagerLayout() {
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const profileName = `${profile?.firstName || 'Hiring'} ${profile?.lastName || 'Manager'}`.trim();

  return (
    <div className="hiring-manager-shell mesh-bg relative flex min-h-screen overflow-hidden text-secondary-900 dark:text-white">
      {/* Decorative ambient bubbles */}
      <div className="particle h-20 w-20 left-[12%]" style={{ animationDuration: '24s' }} />
      <div className="particle h-32 w-32 left-[48%]" style={{ animationDuration: '30s', animationDelay: '2s' }} />
      <div className="particle h-16 w-16 left-[78%]" style={{ animationDuration: '20s', animationDelay: '5s' }} />

      <aside className="relative z-10 flex w-72 shrink-0 flex-col border-r border-white/60 bg-white/75 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <div className="relative shrink-0 overflow-hidden border-b border-secondary-100 p-6 dark:border-white/10">
          <img
            src="/images/card-bg-ai-matching.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply dark:opacity-40 dark:mix-blend-screen"
          />
          <div className="relative">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-primary-600 text-h4 text-white shadow-glow-primary">
              M
            </div>
            <h2 className="mt-4 text-h2 text-secondary-900 dark:text-white">Manager Portal</h2>
            <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
              Hiring Manager center
            </p>
            <Badge variant="ai" size="sm" className="mt-4">
              Decision Workspace
            </Badge>
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
                  isActive
                    ? 'bg-white text-indigo-700 shadow-glow-primary dark:bg-white/10 dark:text-indigo-300'
                    : 'text-secondary-600 hover:bg-white/70 hover:text-indigo-700 dark:text-secondary-300 dark:hover:bg-white/10 dark:hover:text-white',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'bg-secondary-100 text-secondary-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:bg-white/5 dark:text-secondary-300',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="m-4 overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ai-700 dark:text-ai-300">
            <Sparkles size={13} strokeWidth={1.75} />
            Hiring manager
          </div>
          <p className="mt-2 text-body-sm leading-relaxed text-secondary-600 dark:text-secondary-300">
            Review candidate summaries and submit interview feedback instantly.
          </p>
        </div>
      </aside>

      <main className="relative z-10 flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/60 bg-white/65 px-8 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/45">
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
              Hiring Manager Dashboard
            </p>
            <h1 className="text-h3 text-secondary-900 dark:text-white">
              Welcome, {profile?.firstName || 'Manager'}!
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

        <div className="relative flex-1 overflow-y-auto p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-indigo-500/[0.08] blur-[90px] dark:bg-indigo-400/[0.14]" />
            <div className="absolute -left-24 bottom-10 h-[360px] w-[360px] rounded-full bg-ai-500/[0.08] blur-[90px] dark:bg-ai-400/[0.14]" />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
