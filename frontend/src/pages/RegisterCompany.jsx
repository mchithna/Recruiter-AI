import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/ui';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function RegisterCompany() {
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, refreshProfile } = useAuth();

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message || 'Google sign up failed.');
        setIsGoogleLoading(false);
      }
    } catch {
      setErrorMsg('An unexpected error occurred with Google Sign-In.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      return setErrorMsg('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      return setErrorMsg('Passwords do not match.');
    }

    setIsSubmitting(true);
    
    // 1. Call supabase.auth.signUp via AuthContext
    const { error: authError } = await signUp(email, password);
    
    if (authError) {
      setErrorMsg(authError.message || 'Failed to create account.');
      setIsSubmitting(false);
      return;
    }

    // 2. Provision internal company profile using the now-active session
    try {
      const api = (await import('../api')).default;
      await api.post('/profile/provision-company-admin', {
        firstName,
        lastName,
        companyName
      });
      // Force a profile refresh so AuthContext knows about the new provisioned data
      await refreshProfile();
      // 3. On success, redirect to /admin (Company Admin dashboard)
      navigate('/admin', { replace: true });
    } catch (err) {
      console.error(err);
      // 4. Fallback message if provisioning fails
      setErrorMsg('Your account was created but setup didn\'t finish; please try logging in.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-secondary-900 dark:text-white mb-2 tracking-tight">Create Company Account</h1>
        <p className="text-secondary-500 dark:text-secondary-400">Hire your next great team member</p>
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
          Sign up with Google
        </Button>
      </div>

      <div className="relative flex items-center mb-6">
        <div className="flex-grow border-t border-secondary-200 dark:border-secondary-700"></div>
        <span className="flex-shrink-0 mx-4 text-xs font-medium text-secondary-400 uppercase tracking-widest">Or register with email</span>
        <div className="flex-grow border-t border-secondary-200 dark:border-secondary-700"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          disabled={isSubmitting || isGoogleLoading}
          placeholder="Acme Corp"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Admin First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isSubmitting || isGoogleLoading}
            placeholder="Jane"
          />
          <Input
            label="Admin Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isSubmitting || isGoogleLoading}
            placeholder="Doe"
          />
        </div>
        
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting || isGoogleLoading}
          placeholder="admin@example.com"
        />
        
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitting || isGoogleLoading}
          placeholder="••••••••"
          helperText="Must be at least 6 characters"
        />
        
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isSubmitting || isGoogleLoading}
          placeholder="••••••••"
        />
        
        <div className="pt-2">
          <Button 
            type="submit" 
            variant="ai" 
            className="w-full h-12 rounded-xl font-bold text-base shadow-md shadow-ai-500/20"
            isLoading={isSubmitting}
            disabled={isGoogleLoading}
          >
            Create Company
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700 text-center">
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Already have an account?{' '}
          <Link to="/login" className="text-ai-600 dark:text-ai-400 hover:text-ai-700 dark:hover:text-ai-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
