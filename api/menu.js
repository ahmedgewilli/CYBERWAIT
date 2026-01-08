import { createSupabaseServerClient } from './supabaseServer.js';
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

    // If the 'menu' query returned data, validate items and return only fully populated items
    if (Array.isArray(data) && data.length > 0) {
      // Keep only items that include all required fields we expect in the UI
      const valid = data.filter((it) => it && it.name && (it.price !== null && it.price !== undefined) && it.description && it.image && it.category);
      if (valid.length > 0) {
        res.setHeader('x-menu-source', 'supabase.menu');
        return res.status(200).json(valid);
      }
      console.warn('Supabase menu returned rows but none were fully populated — falling back to menu_items or bundled seed');
    }

    // If no usable 'menu' rows, try 'menu_items' table
    if (!data || data.length === 0) {
      const r = await sb.from('menu_items').select('*').order('id');
      if (r.error) {
        console.warn('Supabase fallback table error:', r.error?.message || r.error);
        res.setHeader('x-menu-source', 'seed');
        return res.status(200).json(MENU_ITEMS);
      }

      if (!r.data || r.data.length === 0) {
        console.warn('Supabase menu tables are empty — falling back to bundled MENU_ITEMS');
        res.setHeader('x-menu-source', 'seed');
        return res.status(200).json(MENU_ITEMS);
      }

      res.setHeader('x-menu-source', 'supabase.menu_items');
      return res.status(200).json(r.data);
    }

    res.setHeader('x-menu-source', 'supabase.menu');
    return res.status(200).json(data);
  } catch (err) {
    console.error('menu API error (unexpected):', err);
    return res.status(200).json(MENU_ITEMS);
  }
}
