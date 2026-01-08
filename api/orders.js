import { createSupabaseServerClient } from './_supabaseServer';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { cart = [], paymentMethod = 'visa', total = 0, cardLast4 = null, cardExpiry = null } = req.body || {};
  const sb = createSupabaseServerClient();

  if (!sb) {
    // No DB available — create a simple in-memory simulation response
    const orderId = Math.floor(Math.random() * 1000000);
    return res.status(201).json({ orderId, orderNumber: `ORD-${Date.now()}`, status: 'pending' });
  }

  try {
    // Insert order using service role key; store only masked card info (never store CVV)
    const orderResult = await sb.from('orders').insert([{ order_number: `ORD-${Date.now()}`, total, payment_method: paymentMethod, card_last4: cardLast4, card_expiry: cardExpiry, status: 'pending' }]).select();
    const orderId = orderResult.data?.[0]?.id || orderResult[0]?.id;

    // Insert order items
    if (Array.isArray(cart) && cart.length && orderId) {
      const items = cart.map(item => ({ order_id: orderId, menu_item_id: item.item.id, quantity: item.quantity, price: item.item.price }));
      await sb.from('order_items').insert(items);
    }

    return res.status(201).json({ orderId, orderNumber: `ORD-${Date.now()}`, status: 'pending' });
  } catch (err) {
    console.error('orders API error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
