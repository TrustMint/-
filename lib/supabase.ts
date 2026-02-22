import { createClient } from '@supabase/supabase-js';

// Fallback values for environments where import.meta.env is undefined or variables are missing
const FALLBACK_URL = 'https://bdspdcaeznbqiepmbrsx.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkc3BkY2Flem5icWllcG1icnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODUzNTQsImV4cCI6MjA4NzM2MTM1NH0.Hr-eSvia09CGFOGWT3Qhuug7XPgBYYRQpnjIJ_ntlMY';

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