import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://vvpjnqqrskonaldeaepz.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cGpucXFyc2tvbmFpZGVhZXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMzU5MDEsImV4cCI6MjEwNzgxMTkwMX0.37_3pCqRZvj_drO5AcTVlVJB0pyrKvcjWP0C5dg4-_U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
