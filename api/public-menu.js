import MENU_ITEMS from '../src/menu_seed.js';

export const config = { runtime: 'nodejs' };

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  // Always return the bundled static menu as a guaranteed public fallback
  res.status(200).json(MENU_ITEMS);
}
