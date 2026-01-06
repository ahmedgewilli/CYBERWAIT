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
    let { data, error } = await sb.from('menu').select('*').order('id');
    if (error || !data || data.length === 0) {
      const r = await sb.from('menu_items').select('*').order('id');
      data = r.data || data;
    }
    return res.status(200).json(data || MENU_ITEMS);
  } catch (err) {
    console.error('menu API error:', err);
    return res.status(200).json(MENU_ITEMS);
  }
}
