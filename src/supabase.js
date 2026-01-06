// Supabase client helper
// Usage:
// 1) Add the following to your .env.local (do NOT commit this file):
//    VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
//    VITE_SUPABASE_ANON_KEY=your-anon-public-anon-key
// 2) In code: import { supabase } from './supabase'
//    const { data, error } = await supabase.from('menu').select('*')

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
