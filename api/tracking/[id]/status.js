import { createSupabaseServerClient } from '../../supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id } = req.query;
  const sb = createSupabaseServerClient();
  if (!sb) return res.status(200).json({ status: 'pending' });

  try {
    const r = await sb.from('orders').select('status').eq('id', id).limit(1).maybeSingle();
    const status = r.data?.status || (r?.status === 200 ? 'pending' : null);
    return res.status(200).json({ status: status || 'pending' });
  } catch (err) {
    console.error('tracking API error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
