import { createSupabaseServerClient } from './supabaseServer.js';
import MENU_ITEMS from '../src/menu_seed.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const sb = createSupabaseServerClient();
  if (!sb) {
    res.setHeader('x-menu-source', 'seed');
    return res.status(200).json(MENU_ITEMS);
  }

  try {
    const { data, error } = await sb.from('menu_items').select('*').order('id');
    if (error || !data || data.length === 0) {
      console.warn('Supabase menu_items error/empty:', error?.message || error || 'empty');
      res.setHeader('x-menu-source', 'seed');
      return res.status(200).json(MENU_ITEMS);
    }

    res.setHeader('x-menu-source', 'supabase.menu_items');
    return res.status(200).json(data);
  } catch (err) {
    console.error('menu API error (unexpected):', err);
    res.setHeader('x-menu-source', 'seed');
    return res.status(200).json(MENU_ITEMS);
  }
}
