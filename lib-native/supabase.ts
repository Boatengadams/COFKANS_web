import { createClient } from '@supabase/supabase-js';
import { loadConfig } from './config';

let supabaseInstance: any = null;

export async function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const config = await loadConfig();
  if (config.mode === 'live' && config.supabaseUrl && config.supabaseAnonKey) {
    try {
      supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
    }
  }
  return null;
}
