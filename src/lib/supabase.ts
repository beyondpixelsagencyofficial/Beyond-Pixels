import { createClient } from '@supabase/supabase-js';

// Project credentials provided by the user
export const SUPABASE_URL = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://ixxqqtlvgoqvrlvhdkhy.supabase.co';

export const SUPABASE_ANON_KEY = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4eHFxdGx2Z29xdnJsdmhka2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4ODY4MzUsImV4cCI6MjEwMzQ2MjgzNX0.6kRdJrC3QYkW9JQ37VNnkn4-QwJ9tAxBeBKQjuLCo8o';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
