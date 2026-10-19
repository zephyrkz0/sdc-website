import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as Record<string, string | undefined>)[key] || '';
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
    return (globalThis as any).process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

const configured = isSupabaseConfigured();

// Create the Supabase client instance (or a safe dummy client if not yet configured)
export const supabase = createClient(
  configured ? supabaseUrl : 'https://sdc-unconfigured-local.supabase.co',
  configured ? supabaseAnonKey : 'dummy-anon-key-local-only-not-configured',
  {
    auth: {
      persistSession: configured,
      autoRefreshToken: configured,
    },
  }
);

