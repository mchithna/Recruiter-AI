import { supabase } from '../supabaseClient';

export const authService = {
  signUp: async (email, password) => {
    return await supabase.auth.signUp({ email, password });
  },
  signInWithPassword: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  signInWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({ provider: 'google' });
  },
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
