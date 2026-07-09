import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Sparkles, Sun, Moon, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const rootEl = document.getElementById('root') || window;
    const onScroll = () => {
      const y = rootEl.scrollTop ?? window.scrollY;
      setScrolled(y > 20);
    };
    rootEl.addEventListener('scroll', onScroll, { passive: true });
    return () => rootEl.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3 glass-light dark:glass-dark border-b border-secondary-200/50 dark:border-secondary-700/50 shadow-glass dark:shadow-glass-dark'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-primary-500 to-ai-600 p-2 rounded-xl shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
              <Sparkles className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-black tracking-tight text-secondary-900 dark:text-white">
              Hirely
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, to }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                      : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                Log In
              </Link>
              <Link
                to="/register/company"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-ai-600 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-[72px] left-0 right-0 glass-light dark:glass-dark border-b border-secondary-200/50 dark:border-secondary-700/50 shadow-lg p-6 animate-slide-up">
            <nav className="flex flex-col gap-1 mb-6">
              {NAV_LINKS.map(({ label, to }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                        : 'text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <Link
                to="/login"
                className="w-full text-center px-4 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-200 border border-secondary-200 dark:border-secondary-600 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register/company"
                className="w-full text-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-ai-600 rounded-xl shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
