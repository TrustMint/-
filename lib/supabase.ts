import { createClient } from '@supabase/supabase-js';

// Fallback values for environments where import.meta.env is undefined or variables are missing
const FALLBACK_URL = 'https://nmjtzeukcvykqhrdawbd.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tanR6ZXVrY3Z5a3FocmRhd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MjUzNjAsImV4cCI6MjA4NzEwMTM2MH0.4tKa_UlGDDfK4r2SZ7Ac1f1WnGGSxF6yoo2vNYnOidg';

const getEnv = (key: string, fallback: string) => {
  try {
    // Safely check for import.meta.env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore errors
  }
  return fallback;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', FALLBACK_URL);
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', FALLBACK_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);