import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const GuestLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 font-sans transition-colors duration-300">
      
      {/* Left Side — Illustration Panel (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary-900 overflow-hidden border-r border-secondary-800">
        
        {/* Background Gradients */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-ai-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-12">
          
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="bg-gradient-to-br from-primary-500 to-ai-600 p-2 rounded-xl shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
              <Sparkles className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Hirely
            </span>
          </Link>
          
          <div className="relative">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-4 animate-slide-up">
              Find the perfect match, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-ai-400">faster than ever.</span>
            </h1>
            <p className="text-secondary-400 text-lg max-w-md animate-slide-up" style={{ animationDelay: '100ms' }}>
              Our AI-powered platform connects brilliant minds with visionary companies in milliseconds.
            </p>
          </div>
          
          <div className="text-secondary-500 text-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
            &copy; {new Date().getFullYear()} Hirely. All rights reserved.
          </div>
        </div>

        {/* Central Illustration Image */}
        <div className="absolute inset-0 z-0 flex items-center justify-center p-12 opacity-80 mix-blend-screen">
          <img 
            src="/images/auth-illustration.png" 
            alt="Abstract illustration" 
            className="w-full max-w-md object-contain animate-float"
          />
        </div>
      </div>

      {/* Right Side — Auth Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        
        {/* Mobile Header / Theme Toggle */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <Link to="/" className="flex lg:hidden items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-primary-500 to-ai-600 p-2 rounded-xl shadow-sm">
              <Sparkles className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-black tracking-tight text-secondary-900 dark:text-white">
              Hirely
            </span>
          </Link>
          
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-700 shadow-sm hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 animate-slide-up">
          <div className="w-full max-w-md relative z-10">
            {/* Soft background glow on mobile */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[80px] -z-10 lg:hidden" />
            
            <Outlet />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default GuestLayout;
