import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { NeuralAnimation, ThemeToggle } from '../components/ui';
import { Home } from 'lucide-react';

const GuestLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex mesh-bg text-secondary-900 dark:text-white font-sans transition-colors duration-300 relative">
      
      {/* Left Side — Illustration Panel (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/60 dark:border-white/5 bg-white/40 dark:bg-secondary-950/40 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.1)]">
        
        {/* Background Gradients inside the dark glass pane */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-ai-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-12">
          
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <img src="/logo.png" alt="Hirely Logo" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <span className="text-3xl font-brand font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-ai-300">
              Hirely
            </span>
          </Link>
          
          <div className="relative">
            <h1 className="text-4xl lg:text-5xl font-black text-secondary-900 dark:text-white leading-[1.1] tracking-tight mb-4 animate-slide-up">
              Find the perfect match, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-ai-500 dark:from-primary-400 dark:to-ai-400">faster than ever.</span>
            </h1>
            <p className="text-secondary-700 dark:text-secondary-400 text-lg max-w-md animate-slide-up" style={{ animationDelay: '100ms' }}>
              Our AI-powered platform connects brilliant minds with visionary companies in milliseconds.
            </p>
          </div>
          
          <div className="text-secondary-600 dark:text-secondary-500 text-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
            &copy; {new Date().getFullYear()} Hirely. All rights reserved.
          </div>
        </div>

        {/* Live Neural Background replacing the static illustration */}
        <NeuralAnimation />
      </div>

      {/* Right Side — Auth Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        
        {/* Mobile Header / Theme Toggle */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <Link to="/" className="flex lg:hidden items-center gap-2.5 group">
            <img src="/logo.png" alt="Hirely Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
            <span className="text-2xl font-brand font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-ai-400">
              Hirely
            </span>
          </Link>
          
          <div className="ml-auto flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-700 shadow-sm hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 text-sm font-medium"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <ThemeToggle />
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
