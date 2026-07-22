import axios from 'axios';
import { supabase } from './supabaseClient';
import { getEnv } from './lib/env';

const apiBaseUrl = getEnv('VITE_API_BASE_URL', '/api');

const api = axios.create({
  baseURL: apiBaseUrl,
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
