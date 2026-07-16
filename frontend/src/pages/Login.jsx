import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/ui';

// Simple Google SVG icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, profile, session, loading } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      setErrorMsg(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (session && profile) {
      const role = profile.role;
      if (role === 'Admin') navigate('/admin', { replace: true });
      else if (role === 'Recruiter') navigate('/recruiter', { replace: true });
      else if (role === 'HiringManager') navigate('/hiring-manager', { replace: true });
      else if (role === 'Candidate') navigate('/candidate', { replace: true });
      else navigate('/', { replace: true }); 
    }
  }, [session, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Invalid credentials. Please try again.');
        setIsSubmitting(false); 
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message || 'Google sign in failed.');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred with Google Sign-In.');
      setIsGoogleLoading(false);
    }
  };

  if (session && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-10 h-10 border-4 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-secondary-500 font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/40 dark:bg-secondary-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-brand font-black text-secondary-900 dark:text-white mb-2 tracking-wide">Welcome Back</h1>
        <p className="text-secondary-600 dark:text-secondary-400">Sign in to your account to continue</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 rounded-xl">
          <p className="text-sm text-danger-700 dark:text-danger-400 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Social Login */}
      <div className="mb-6">
        <Button 
          type="button" 
          variant="glass" 
          className="w-full h-12 rounded-xl shadow-sm flex items-center justify-center font-bold gap-2"
          onClick={handleGoogleSignIn}
          isLoading={isGoogleLoading}
          disabled={isSubmitting}
          leftIcon={!isGoogleLoading ? <GoogleIcon /> : null}
        >
          Sign in with Google
        </Button>
      </div>

      <div className="relative flex items-center mb-6">
        <div className="flex-grow border-t border-secondary-200 dark:border-secondary-700"></div>
        <span className="flex-shrink-0 mx-4 text-xs font-medium text-secondary-400 uppercase tracking-widest">Or continue with email</span>
        <div className="flex-grow border-t border-secondary-200 dark:border-secondary-700"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting || isGoogleLoading}
          placeholder="you@example.com"
        />
        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting || isGoogleLoading}
            placeholder="••••••••"
          />
          <div className="flex justify-end">
            <a href="#" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              Forgot password?
            </a>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            variant="glass" 
            className="w-full h-12 rounded-xl font-black tracking-wide text-base"
            isLoading={isSubmitting}
            disabled={isGoogleLoading}
          >
            Sign In
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
          Don't have an account yet?
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register/candidate" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors border-b border-transparent hover:border-primary-600 dark:hover:border-primary-400 pb-0.5">
            I'm a Candidate
          </Link>
          <div className="w-1 h-1 rounded-full bg-secondary-300 dark:bg-secondary-700"></div>
          <Link to="/register/company" className="text-sm font-semibold text-ai-600 dark:text-ai-400 hover:text-ai-700 dark:hover:text-ai-300 transition-colors border-b border-transparent hover:border-ai-600 dark:hover:border-ai-400 pb-0.5">
            I'm an Employer
          </Link>
        </div>
      </div>
    </div>
  );
}
