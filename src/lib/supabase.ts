import { createClient } from '@supabase/supabase-js';

// Lazy initialization to prevent build-time errors
let browserClient: ReturnType<typeof createClient> | null = null;

// Client-side Supabase instance (uses anon key)
export const supabase = () => {
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
};

// Server-side helper using service role key (only configured in env, never hard-coded)
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

