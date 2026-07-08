import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../lib/authService';
import api from '../api';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (currentSession) => {
      if (!currentSession) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/profile/me');
        if (mounted) {
          setProfile(response.data);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          if (mounted) setProfile(null);
        } else {
          console.error('Error fetching profile:', error);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Ensure we capture initial session if onAuthStateChange doesn't fire immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) {
        setSession(session);
        fetchProfile(session);
      }
    });

    const { data: authListener } = authService.onAuthStateChange((event, newSession) => {
      if (mounted) {
        setSession(newSession);
        fetchProfile(newSession);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    profile,
    loading,
    signIn: authService.signInWithPassword,
    signUp: authService.signUp,
    signOut: authService.signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
