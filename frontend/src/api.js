import axios from 'axios';
import { supabase } from './supabaseClient';
import { requireEnv } from './lib/env';

const api = axios.create({
  baseURL: requireEnv('VITE_API_BASE_URL'),
});

api.interceptors.request.use(async (config) => {
  if (config.skipAuth) {
    return config;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
