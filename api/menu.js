import { createSupabaseServerClient } from './_supabaseServer';
import MENU_ITEMS from '../src/menu_seed.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const sb = createSupabaseServerClient();
  if (!sb) {
    // Fallback to bundled seed
    return res.status(200).json(MENU_ITEMS);
  }

  try {
    // Try 'menu' first, then 'menu_items'
    const { data, error } = await sb.from('menu').select('*').order('id');
    if (error) {
      // If Supabase returns an auth/error (e.g., 401), we still return the public menu
      console.warn('Supabase returned error for menu:', error?.message || error);
      return res.status(200).json(MENU_ITEMS);
    }

    if (!data || data.length === 0) {
      const r = await sb.from('menu_items').select('*').order('id');
      if (r.error) {
        console.warn('Supabase fallback table error:', r.error?.message || r.error);
        return res.status(200).json(MENU_ITEMS);
      }
      return res.status(200).json(r.data || MENU_ITEMS);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('menu API error (unexpected):', err);
    return res.status(200).json(MENU_ITEMS);
  }
}
