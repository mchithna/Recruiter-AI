import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`group relative flex items-center justify-center shrink-0 w-9 h-9 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 ${className}`}
      aria-label="Toggle theme"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)',
        border: theme === 'dark'
          ? '1px solid rgba(251,191,36,0.25)'
          : '1px solid rgba(99,102,241,0.2)',
        boxShadow: theme === 'dark'
          ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(251,191,36,0.12)'
          : 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(99,102,241,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'}} />
      {theme === 'dark'
        ? <Sun  size={15} strokeWidth={2} className="text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
        : <Moon size={15} strokeWidth={2} className="text-indigo-500" />
      }
    </button>
  );
}
