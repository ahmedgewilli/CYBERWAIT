import { createClient } from '@supabase/supabase-js';

export function createSupabaseServerClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    console.warn('createSupabaseServerClient: SUPABASE URL is not set (VITE_SUPABASE_URL / SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL)');
    return null;
  }

  // Prefer service role key when doing writes from the server
  if (!serviceRole) {
    console.warn('createSupabaseServerClient: SUPABASE_SERVICE_ROLE not set — server will use anon key and may be blocked by RLS for writes');
  } else {
    console.log('createSupabaseServerClient: using SUPABASE_SERVICE_ROLE for server operations');
  }

  const key = serviceRole || anon;
  return createClient(url, key, { auth: { persistSession: false } });
}
