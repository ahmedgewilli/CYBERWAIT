export const config = { runtime: 'nodejs' };

export default function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.status(200).json({ ok: true, service: 'api' });
}
