import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authService } from '../lib/authService';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Guard against double-fetching from both getSession() and onAuthStateChange(INITIAL_SESSION)
  const fetchingRef = useRef(false);

  const fetchProfile = useCallback(async (currentSession) => {
    if (!currentSession) {
      setSession(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    // Prevent duplicate concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setSession(currentSession);

    try {
      const response = await api.get('/profile/me');
      setProfile(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // User exists in Supabase but not yet provisioned in our backend
        setProfile(null);
      } else if (error.response?.status === 401) {
        // Token is invalid or expired — treat as not logged in
        // Supabase SDK will handle token refresh via onAuthStateChange if possible
        setSession(null);
        setProfile(null);
      } else {
        // Network error or unexpected failure — don't blow up, just leave profile null
        console.error('Error fetching profile:', error);
        setProfile(null);
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // onAuthStateChange is the primary listener — it fires INITIAL_SESSION on mount
    // and TOKEN_REFRESHED / SIGNED_IN / SIGNED_OUT for lifecycle events.
    // We rely on this exclusively (not getSession) to avoid duplicate fetches.
    const { data: authListener } = authService.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // For INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED — fetch profile
      fetchProfile(newSession);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const value = {
    session,
    profile,
    loading,
    signIn: authService.signInWithPassword,
    signUp: authService.signUp,
    signInWithGoogle: authService.signInWithGoogle,
    signOut: authService.signOut,
    refreshProfile: () => fetchProfile(session),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
