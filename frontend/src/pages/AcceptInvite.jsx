import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/ui';
import api from '../api';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { signUp, refreshProfile } = useAuth();

  const [inviteData, setInviteData] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidationError("This invite link is no longer valid — ask your company admin to resend it");
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await api.get(`/auth/invite/validate?token=${encodeURIComponent(token)}`);
        setInviteData(response.data);
      } catch (err) {
        setValidationError("This invite link is no longer valid — ask your company admin to resend it");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

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
    
    // 1. Sign up with Supabase using the locked invite email
    const { error: authError } = await signUp(inviteData.email, password);
    
    if (authError) {
      setErrorMsg(authError.message || 'Failed to create account.');
      setIsSubmitting(false);
      return;
    }

    // 2. Call completion endpoint with the newly active session
    try {
      await api.post('/auth/invite/complete', {
        token,
        firstName,
        lastName
      });
      await refreshProfile();
      // 3. Redirect based on role
      const role = inviteData.roleName;
      if (role === 'Recruiter') {
        navigate('/recruiter', { replace: true });
      } else if (role === 'HiringManager') {
        navigate('/hiring-manager', { replace: true });
      } else {
        // Fallback just in case
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error(err);
      // 4. Fallback message if provisioning fails
      setErrorMsg('Your account was created but we couldn\'t finish linking your invite; contact your admin.');
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger-100 text-danger-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Invalid Invite</h2>
        <p className="text-body-md text-secondary-600 dark:text-secondary-400">{validationError}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="text-center mb-8">
        <h1 className="text-h3 font-bold text-secondary-900 dark:text-white mb-2">Accept Invitation</h1>
        <p className="text-body-md text-secondary-500">Join your team to get started</p>
      </div>

      <div className="mb-6 p-4 bg-secondary-50 dark:bg-slate-700/50 rounded-lg border border-secondary-200 dark:border-slate-600">
        <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">Invitation Details</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-secondary-500 dark:text-secondary-400">Email</dt>
            <dd className="font-medium text-secondary-900 dark:text-white truncate">{inviteData.email}</dd>
          </div>
          <div>
            <dt className="text-secondary-500 dark:text-secondary-400">Company</dt>
            <dd className="font-medium text-secondary-900 dark:text-white truncate">{inviteData.companyName}</dd>
          </div>
          <div>
            <dt className="text-secondary-500 dark:text-secondary-400">Role</dt>
            <dd className="font-medium text-secondary-900 dark:text-white">{inviteData.roleName}</dd>
          </div>
          {inviteData.departmentName && (
            <div>
              <dt className="text-secondary-500 dark:text-secondary-400">Department</dt>
              <dd className="font-medium text-secondary-900 dark:text-white truncate">{inviteData.departmentName}</dd>
            </div>
          )}
        </dl>
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
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}
