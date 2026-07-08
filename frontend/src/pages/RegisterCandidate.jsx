import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/ui';
import api from '../api';

export default function RegisterCandidate() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { signUp, refreshProfile } = useAuth();

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

    // 2. Provision internal candidate profile using the now-active session
    try {
      await api.post('/profile/provision-candidate', {
        firstName,
        lastName
      });
      // Force a profile refresh so AuthContext knows about the new provisioned data
      await refreshProfile();
      // 3. On success, redirect to /candidate
      navigate('/candidate', { replace: true });
    } catch (err) {
      console.error(err);
      // 4. Fallback message if provisioning fails
      setErrorMsg('Your account was created but setup didn\'t finish; please try logging in.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="text-center mb-8">
        <h1 className="text-h3 font-bold text-secondary-900 dark:text-white mb-2">Create Candidate Account</h1>
        <p className="text-body-md text-secondary-500">Find your next great opportunity</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-md">
          <p className="text-body-sm text-danger-700 font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="John"
          />
          <Input
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Doe"
          />
        </div>
        
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
          helperText="Must be at least 6 characters"
        />
        
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="••••••••"
        />
        
        <div className="pt-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            isLoading={isSubmitting}
          >
            Sign Up
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700 text-center">
        <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
