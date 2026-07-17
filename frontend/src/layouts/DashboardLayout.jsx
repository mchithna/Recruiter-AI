import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  Sun,
  Building2,
  Network,
  BarChart2,
  ClipboardList,
  User,
  FileText,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import ChatBot from '../components/chat/ChatBot';
import { Avatar, ThemeToggle } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const navItemsByRole = {
  Recruiter: [
    { name: 'Home',       path: '/recruiter/home',       icon: Home },
    { name: 'Jobs',       path: '/recruiter/jobs',       icon: Briefcase },
    { name: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
    { name: 'Messages',   path: '/recruiter/messages',   icon: MessageSquare },
  ],
  Admin: [
    { name: 'Company Profile', path: '/admin/company',    icon: Building2 },
    { name: 'Org Chart',       path: '/admin/org-chart',  icon: Network },
    { name: 'Analytics',       path: '/admin/analytics',  icon: BarChart2 },
    { name: 'Activity Log',    path: '/admin/activity',   icon: ClipboardList },
  ],
  Candidate: [
    { name: 'Home',         path: '/candidate/home',         icon: Home },
    { name: 'Profile',      path: '/candidate/profile',      icon: User },
    { name: 'Documents',    path: '/candidate/documents',    icon: FileText },
    { name: 'Jobs',         path: '/candidate/jobs',         icon: Briefcase },
    { name: 'Applications', path: '/candidate/applications', icon: ClipboardList },
  ],
  HiringManager: [
    { name: 'Dashboard', path: '/hiring-manager', icon: Home },
  ],
  Guest: [
    { name: 'Overview', path: '/dashboard', icon: Home },
  ],
};

export default function DashboardLayout() {
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const role        = profile?.role || 'Guest';
  const navItems    = navItemsByRole[role] || navItemsByRole.Guest;
  const profileName = `${profile?.firstName || role} ${profile?.lastName || ''}`.trim();
  const firstName   = profile?.firstName || role;

  /* ─── Nav item renderer ──────────────────────────────────────── */
  const renderNavItem = (item, collapsed = false) => {
    const Icon     = item.icon;
    const isActive = location.pathname.startsWith(item.path);

    const linkContent = (
      <Link
        to={item.path}
        className={[
          // Uniform height + padding for ALL items (active and inactive)
          'group relative flex items-center h-11 rounded-2xl px-3 text-sm font-semibold w-full transition-all duration-200 overflow-hidden',
          isActive
            ? 'bg-primary-500/15 text-primary-700 dark:bg-primary-400/20 dark:text-primary-200'
            : 'text-secondary-600 hover:bg-white/60 hover:text-primary-700 dark:text-secondary-400 dark:hover:bg-white/8 dark:hover:text-white',
        ].join(' ')}
      >
        {/* Hover shimmer */}
        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Icon pill — same w-8 h-8 for BOTH active and inactive */}
        <span className={[
          'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
          isActive
            ? 'bg-primary-500/20 text-primary-600 shadow-[0_0_0_1px_rgba(99,102,241,0.3)] dark:bg-primary-400/30 dark:text-primary-300'
            : 'bg-white/50 text-secondary-400 dark:bg-white/5 dark:text-secondary-500 group-hover:bg-primary-50 group-hover:text-primary-500 dark:group-hover:bg-primary-400/10 dark:group-hover:text-primary-400',
          collapsed ? 'mx-auto' : 'mr-3',
        ].join(' ')}>
          <Icon size={16} strokeWidth={2} />
          {isActive && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
            </span>
          )}
        </span>

        {!collapsed && <span className="truncate">{item.name}</span>}
      </Link>
    );

    return (
      <div key={item.name} className="w-full">
        {linkContent}
      </div>
    );
  };


  return (
    /*
     * Shell: flex on BOTH mobile and desktop.
     * On mobile the sidebar overlays (fixed) so it doesn't participate in flow.
     * On desktop the sidebar is relative / in-flow.
     */
    <div className="recruiter-shell relative flex h-[100dvh] w-screen overflow-hidden text-secondary-900 dark:text-white">

      {/* ─── Mobile overlay backdrop ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-[70] flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'w-[272px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed
            ? 'md:relative md:z-10 md:translate-x-0 md:w-[72px] md:shrink-0'
            : 'md:relative md:z-10 md:translate-x-0 md:w-[272px] md:shrink-0',
        ].join(' ')}
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.52) 0%, rgba(240,235,255,0.38) 50%, rgba(255,255,255,0.28) 100%)',
          backdropFilter: 'blur(32px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
          borderRight: '1px solid rgba(255,255,255,0.55)',
          boxShadow: '4px 0 40px rgba(99,102,241,0.08), inset -1px 0 0 rgba(255,255,255,0.5)',
        }}
      >
        {/* Animated blob inside sidebar */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div style={{
            position: 'absolute', top: '-30%', left: '-20%',
            width: '160%', height: '160%',
            background: 'conic-gradient(from 180deg at 40% 30%, rgba(99,102,241,0.12) 0deg, rgba(168,85,247,0.09) 90deg, rgba(236,72,153,0.06) 180deg, rgba(99,102,241,0.08) 270deg, rgba(99,102,241,0.12) 360deg)',
            animation: 'sidebar-orb 18s linear infinite',
            borderRadius: '50%',
          }} />
        </div>

        {/* ── Sidebar Header: Logo + Brand ────────────────────── */}
        <div className="relative shrink-0 overflow-hidden flex items-center h-[80px] px-4"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.4)',
            // Simpler, cleaner gradient to highlight the logo without distracting elements
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(240,240,255,0.15) 100%)',
          }}
        >
          {/* Subtle bottom glow for depth, without harsh shapes */}
          <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px]" style={{
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
            boxShadow: '0 -2px 12px rgba(99,102,241,0.4)',
          }} />

          <Link to="/" className="relative flex items-center gap-3 flex-1 min-w-0 z-10 group">
            {/* Logo — Transparent background, increased size */}
            <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Hirely Logo"
                className="w-[42px] h-[42px] object-contain drop-shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
              />
            </div>

            {/* Brand name + subtitle */}
            <div className={[
              'transition-all duration-300 overflow-hidden',
              isCollapsed ? 'md:w-0 md:opacity-0' : 'w-full opacity-100',
            ].join(' ')}>
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] font-black tracking-tight whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Hirely
                </span>
                <Sparkles size={11} className="text-violet-400 shrink-0" />
              </div>
              <p className="text-[10px] font-medium text-secondary-500 dark:text-secondary-400 whitespace-nowrap leading-none mt-0.5 tracking-wide uppercase">
                {role} Command Center
              </p>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="relative z-10 md:hidden flex items-center justify-center w-8 h-8 rounded-xl text-secondary-500 transition-all hover:bg-white/40 hover:text-secondary-700 shrink-0"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav items ────────────────────────────────────────── */}
        <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 custom-scrollbar">
          {navItems.map(item => renderNavItem(item, isCollapsed))}
        </nav>

        {/* ── Desktop collapse toggle ───────────────────────── */}
        <div className="relative z-10 hidden md:flex shrink-0 p-3 items-center justify-end"
          style={{ borderTop: '1px solid rgba(255,255,255,0.4)' }}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center rounded-xl w-8 h-8 transition-all duration-300 group hover:scale-[1.05] active:scale-95"
            style={theme === 'dark' ? {
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.15) 100%)',
              border: '1px solid rgba(168,85,247,0.4)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(168,85,247,0.2)',
              backdropFilter: 'blur(12px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.5)',
            } : {
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(99,102,241,0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed
              ? <ChevronRight size={15} strokeWidth={2.5} className={theme === 'dark' ? "text-fuchsia-300 drop-shadow-[0_0_6px_rgba(217,70,239,0.8)]" : "text-primary-600 transition-colors group-hover:text-primary-800"} />
              : <ChevronLeft  size={15} strokeWidth={2.5} className={theme === 'dark' ? "text-fuchsia-300 drop-shadow-[0_0_6px_rgba(217,70,239,0.8)]" : "text-primary-600 transition-colors group-hover:text-primary-800"} />
            }
          </button>
        </div>
      </aside>

      {/* ─── Main: header + page content ─────────────────────────── */}
      <main className="relative flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Liquid Glass Header ──────────────────────────────── */}
        <header
          className="shrink-0 relative z-30 flex h-[60px] items-center justify-between px-4 md:px-6 overflow-hidden"
          style={{
            background: 'linear-gradient(105deg, rgba(255,255,255,0.78) 0%, rgba(245,243,255,0.70) 40%, rgba(255,255,255,0.72) 100%)',
            backdropFilter: 'blur(32px) saturate(2) brightness(1.04)',
            WebkitBackdropFilter: 'blur(32px) saturate(2) brightness(1.04)',
            borderBottom: '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 4px 24px rgba(99,102,241,0.07), 0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.04) inset',
          }}
        >
          {/* Animated rainbow shimmer strip */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 20%, rgba(168,85,247,0.5) 40%, rgba(236,72,153,0.35) 60%, rgba(99,102,241,0.4) 80%, transparent 100%)',
              animation: 'shimmer-slide 6s linear infinite',
              backgroundSize: '200% 100%',
            }}
          />

          {/* Subtle glass highlight top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.9) 70%, transparent)' }}
          />

          {/* Floating orb left */}
          <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-32 h-8 pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />

          {/* ── Left: hamburger + greeting ──────────────────── */}
          <div className="flex items-center gap-3 min-w-0 z-10">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 shrink-0 hover:scale-[1.05] active:scale-95"
              style={theme === 'dark' ? {
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(56,182,255,0.15) 100%)',
                border: '1px solid rgba(56,182,255,0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(56,182,255,0.2)',
                backdropFilter: 'blur(12px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(12px) saturate(1.5)',
              } : {
                background: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.75)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              aria-label="Open menu"
            >
              <Menu size={18} strokeWidth={2} className={theme === 'dark' ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" : "text-secondary-700"} />
            </button>

            <div className="min-w-0">
              <p className="hidden md:block text-[9px] font-black uppercase tracking-[0.18em] text-secondary-400 leading-none mb-0.5">
                {role} dashboard
              </p>
              <h1 className="text-[15px] md:text-lg font-bold text-secondary-900 dark:text-white truncate leading-tight">
                Welcome, <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  {firstName}
                </span>!
              </h1>
            </div>
          </div>

          {/* ── Right: actions ───────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            <ThemeToggle />

            {/* Sign-out: pill with icon + text on md+, icon-only on mobile */}
            <button
              onClick={handleSignOut}
              className="group relative flex items-center gap-1.5 overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95"
              aria-label="Sign out"
              style={theme === 'dark' ? {
                paddingLeft: '10px',
                paddingRight: '14px',
                height: '36px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(249,115,22,0.15) 100%)',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(239,68,68,0.25)',
                backdropFilter: 'blur(16px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
              } : {
                paddingLeft: '10px',
                paddingRight: '14px',
                height: '36px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(239,68,68,0.18)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(239,68,68,0.07)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: theme === 'dark' ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(255,120,120,0.04) 100%)' }}
              />
              <LogOut size={15} strokeWidth={2.5} className={theme === 'dark' ? "text-orange-300 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)] relative z-10 shrink-0 group-hover:text-orange-200 transition-colors" : "text-red-400 group-hover:text-red-500 transition-colors shrink-0 relative z-10"} />
              {/* Label: visible on md+ only */}
              <span className={['hidden md:inline text-[13px] font-semibold transition-colors relative z-10 whitespace-nowrap', theme === 'dark' ? 'text-orange-200 group-hover:text-orange-100 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]' : 'text-secondary-600 group-hover:text-red-500'].join(' ')}>
                Sign out
              </span>
            </button>

            <Avatar name={profileName} size="sm" />
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          <div className="w-full px-4 py-4 md:px-6 md:py-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Chatbot */}
      {role === 'Candidate' && <ChatBot />}
    </div>
  );
}
