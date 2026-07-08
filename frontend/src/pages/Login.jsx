import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, profile, session, loading } = useAuth();

  // If there's an error message passed from the router (e.g. from ProtectedRoute)
  useEffect(() => {
    if (location.state?.message) {
      setErrorMsg(location.state.message);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  // Listen for profile changes to redirect after successful login + profile fetch
  useEffect(() => {
    if (session && profile) {
      const role = profile.role;
      if (role === 'Admin') navigate('/admin', { replace: true });
      else if (role === 'Recruiter') navigate('/recruiter', { replace: true });
      else if (role === 'HiringManager') navigate('/hiring-manager', { replace: true });
      else if (role === 'Candidate') navigate('/candidate', { replace: true });
      else navigate('/', { replace: true }); // Fallback
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
        setIsSubmitting(false); // Only set false if error. On success, keep loading while profile is fetched.
      }
      // On success, we don't set isSubmitting to false because we want to wait for profile fetch and redirect
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  // If already logged in and profile is loading, show loading UI
  if (session && loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="text-center mb-8">
        <h1 className="text-h3 font-bold text-secondary-900 dark:text-white mb-2">Welcome Back</h1>
        <p className="text-body-md text-secondary-500">Sign in to your account to continue</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-md">
          <p className="text-body-sm text-danger-700 font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="••••••••"
        />
        
        <div className="pt-2">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
        <p className="text-body-sm text-center text-secondary-600 dark:text-secondary-400 mb-4">
          Don't have an account yet?
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/register/candidate" className="w-full block">
            <Button type="button" variant="outline" className="w-full">
              Register as Candidate
            </Button>
          </Link>
          <Link to="/register/company" className="w-full block">
            <Button type="button" variant="outline" className="w-full">
              Register as Company
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
