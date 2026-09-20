// Supabase browser client.
// IMPORTANT: never hard-code a Supabase API key here. Vite exposes only VITE_*
// variables to the browser, and the publishable/anon key is intended for that use.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const env = (import.meta as ImportMeta & {
  env?: {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_PUBLISHABLE_KEY?: string;
    VITE_SUPABASE_ANON_KEY?: string;
  };
}).env ?? {};

const SUPABASE_URL = env.VITE_SUPABASE_URL?.trim();
const SUPABASE_KEY = (
  env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  env.VITE_SUPABASE_ANON_KEY?.trim()
);

if (!SUPABASE_URL) {
  throw new Error(
    'BizBase configuration error: VITE_SUPABASE_URL is missing. Add it to the Vercel Environment Variables and redeploy.'
  );
}

if (!SUPABASE_KEY) {
  throw new Error(
    'BizBase configuration error: VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) is missing. Add it to the Vercel Environment Variables and redeploy.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
