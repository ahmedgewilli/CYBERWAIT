import { createSupabaseServerClient } from '../../supabaseServer.js';

export const config = { runtime: 'nodejs' };

const getId = (req) => {
  const raw = req.query?.id;
  if (Array.isArray(raw)) return raw[0];
  return raw ?? null;
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = getId(req);
  if (!id) return res.status(400).json({ error: 'missing id' });

  const sb = createSupabaseServerClient();
  if (!sb) {
    return res.status(200).json({ status: 'pending', persisted: false, simulated: true });
  }

  try {
    if (req.method === 'PUT') {
      const { status } = req.body || {};
      if (!status) return res.status(400).json({ error: 'missing status' });
      const { data, error } = await sb
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select('id,status')
        .single();
      if (error) {
        console.error('tracking API update error:', error);
        return res.status(200).json({ status: 'pending', persisted: false, error: error.message });
      }
      return res.status(200).json({ status: data?.status ?? status, persisted: true });
    }

    if (req.method !== 'GET') return res.status(405).end();

    const { data, error } = await sb.from('orders').select('status').eq('id', id).single();
    if (error) {
      console.error('tracking API read error:', error);
      return res.status(200).json({ status: 'pending', persisted: false, error: error.message });
    }

    return res.status(200).json({ status: data?.status ?? 'pending', persisted: true });
  } catch (err) {
    console.error('tracking API error:', err);
    return res.status(200).json({ status: 'pending', persisted: false, error: String(err) });
  }
}
