import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lazy client initialization to prevent crash on missing ENV
let supabaseClient: any = null;

export const getSupabase = () => {
  const isUrlValid = (url: string | undefined) => {
    try {
      if (!url) return false;
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (!isUrlValid(supabaseUrl) || !supabaseAnonKey) {
    if (!supabaseClient) { // Only log once
      console.warn('Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables to enable the Bag Management system.');
      supabaseClient = "missing"; // Marker to avoid repeated logs
    }
    return null;
  }
  
  if (!supabaseClient || supabaseClient === "missing") {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey);
  }
  
  return supabaseClient;
};
