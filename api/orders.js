import { createSupabaseServerClient } from './supabaseServer.js'; 

export const config = { runtime: 'nodejs' };

function makeRequestId() {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return uuid;
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isValidCartItem(entry) {
  if (!entry || typeof entry !== 'object') return false;

  const item = entry.item;
  const qty = entry.quantity;

  if (!item || typeof item !== 'object') return false;
  if (item.id === undefined || item.id === null) return false;

  const price = Number(item.price);
  if (!Number.isFinite(price) || price < 0) return false;

  if (!Number.isFinite(qty) || qty <= 0) return false;

  return true;
}

export default async function handler(req, res) {
  // Allow preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const requestId = makeRequestId();

  try {
    const body = req.body || {};
    const cart = body.cart ?? [];
    const paymentMethod = body.paymentMethod ?? 'visa';
    const cardLast4 = body.cardLast4 ?? null;
    const cardExpiry = body.cardExpiry ?? null;

    // Never accept/store CVV
    // If frontend sends it by mistake, we ignore it.

    if (!Array.isArray(cart)) {
      return res.status(400).json({ error: 'cart must be an array', persisted: false, requestId });
    }
    if (!cart.every(isValidCartItem)) {
      return res.status(400).json({ error: 'invalid cart item', persisted: false, requestId });
    }

    // Compute total on server (don’t trust client total)
    const computedTotal = cart.reduce((sum, row) => {
      return sum + Number(row.item.price) * Number(row.quantity);
    }, 0);

    const sb = createSupabaseServerClient();
    if (!sb) {
      console.warn(`[${requestId}] Supabase server client not configured (simulation mode)`);
      const orderNumber = `ORD-${Date.now()}`;
      return res.status(201).json({
        orderId: Math.floor(Math.random() * 1000000),
        orderNumber,
        status: 'pending',
        persisted: false,
        simulated: true,
        requestId,
      });
    }

    const orderNumber = `ORD-${Date.now()}`;

    // Insert order and return inserted row
    const { data: orderData, error: orderError } = await sb
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          total: computedTotal,
          payment_method: paymentMethod,
          card_last4: cardLast4,
          card_expiry: cardExpiry,
          status: 'pending',
        },
      ])
      .select('id, order_number, status')
      .single();

    if (orderError) {
      console.error(`[${requestId}] orders insert error`, orderError);
      return res.status(500).json({ error: orderError.message, persisted: false, requestId });
    }

    const orderId = orderData?.id;
    if (!orderId) {
      console.error(`[${requestId}] orders insert returned no id`, orderData);
      return res.status(500).json({ error: 'Order insert returned no id', persisted: false, requestId });
    }

    // Insert order items
    if (cart.length) {
      const items = cart.map((row) => ({
        order_id: orderId,
        product_id: row.item.id,
        quantity: row.quantity,
        price: Number(row.item.price),
      }));

      const { error: itemsError } = await sb.from('order_items').insert(items);

      if (itemsError) {
        console.error(`[${requestId}] order_items insert error`, itemsError);
        return res.status(500).json({ error: itemsError.message, persisted: false, requestId });
      }
    }

    return res.status(201).json({
      orderId,
      orderNumber: orderData.order_number,
      status: orderData.status ?? 'pending',
      persisted: true,
      requestId,
    });
  } catch (err) {
    console.error(`[${requestId}] orders API exception`, err);
    return res.status(500).json({ error: 'Internal error', detail: String(err), persisted: false, requestId });
  }
}
