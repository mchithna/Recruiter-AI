import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Calendar, Home, LogOut, MessageSquare } from 'lucide-react';
import { Avatar, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { name: 'Home', path: '/recruiter/home', icon: Home },
  { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
  { name: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
  { name: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
];

export default function RecruiterLayout() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const profileName = `${profile?.firstName || 'Recruiter'} ${profile?.lastName || ''}`.trim();

  return (
    <div className="flex min-h-screen bg-secondary-50 text-secondary-900">
      <aside className="flex w-64 shrink-0 flex-col border-r border-secondary-200 bg-white shadow-sm">
        <div className="shrink-0 border-b border-secondary-100 p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-button bg-primary-600 text-h4 text-white shadow-glow-primary">
            H
          </div>
          <h2 className="mt-3 text-h3 text-secondary-900">Hirely</h2>
          <p className="mt-1 text-body-sm text-secondary-500">Recruiter Portal</p>
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
                  'flex items-center gap-3 rounded-button px-4 py-2.5 text-body-sm font-semibold',
                  'transition-all duration-base',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-row-hover'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-primary-700',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-secondary-200 bg-white px-8 shadow-sm">
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-secondary-400">
              Recruiter dashboard
            </p>
            <h1 className="text-h4 text-secondary-900">
              Welcome, {profile?.firstName || 'Recruiter'}!
            </h1>
          </div>

          <div className="flex items-center gap-3">
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

        <div className="mesh-bg flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
