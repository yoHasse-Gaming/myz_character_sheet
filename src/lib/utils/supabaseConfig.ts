/**
 * Supabase Configuration
 * Replace these values with your actual Supabase project credentials
 */

export const SUPABASE_CONFIG = {
  url: 'https://nonfjkoaxdnyiuanmyzb.supabase.co', // Replace with your Supabase URL
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbmZqa29heGRueWl1YW5teXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjkxMzQsImV4cCI6MjA2OTU0NTEzNH0.SIt7zlEMTHb-B0DKXHWkoYxZUJzDV-c11cRsSA0puOM' // Replace with your Supabase anon key
};

export const getSupabaseConfig = () => {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (envUrl && envKey) {
        return {
            url: envUrl,
            anonKey: envKey
        };
    }
    
    return SUPABASE_CONFIG;
};
