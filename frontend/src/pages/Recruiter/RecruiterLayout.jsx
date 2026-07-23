import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Home,
  LogOut,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Avatar, Badge, Button, Tooltip, ThemeToggle } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { name: 'Home', path: '/recruiter/home', icon: Home },
  { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
  { name: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
  { name: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
];

export default function RecruiterLayout() {
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const profileName = `${profile?.firstName || 'Recruiter'} ${profile?.lastName || ''}`.trim();

  return (
    <div className="recruiter-shell relative flex min-h-screen overflow-hidden text-secondary-900 dark:text-white">

      <aside className="relative z-10 flex w-72 shrink-0 flex-col border-r border-white/60 bg-white/75 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <div className="relative shrink-0 overflow-hidden border-b border-secondary-100 p-6 dark:border-white/10">
          <img
            src="/images/card-bg-ai-matching.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply dark:opacity-40 dark:mix-blend-screen"
          />
          <div className="relative">
            <img
              src="/logo.png"
              alt="Hirely Logo"
              className="h-11 w-11 object-contain drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            />
            <h2 className="mt-4 text-h2 text-secondary-900 dark:text-white">Hirely</h2>
            <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-400">
              Recruiter command center
            </p>
            <Badge variant="ai" size="sm" className="mt-4">
              AI-assisted hiring
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
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="m-4 overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ai-700 dark:text-ai-300">
            <Sparkles size={13} strokeWidth={1.75} />
            Smart cue
          </div>
          <p className="mt-2 text-body-sm leading-relaxed text-secondary-600 dark:text-secondary-300">
            Prioritize high-score candidates before scheduling new screens.
          </p>
        </div>
      </aside>

      <main className="relative z-10 flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/60 bg-white/65 px-8 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/45">
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
              Recruiter dashboard
            </p>
            <h1 className="text-h3 text-secondary-900 dark:text-white">
              Welcome, {profile?.firstName || 'Recruiter'}!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
