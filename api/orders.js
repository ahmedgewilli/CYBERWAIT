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
  const qty = Number(entry.quantity);

  if (!item || typeof item !== 'object') return false;
  if (item.id === undefined || item.id === null) return false;
  const idType = typeof item.id;
  if (idType !== 'string' && idType !== 'number') return false;
  if (idType === 'string' && item.id.trim().length === 0) return false;
  if (idType === 'number' && !Number.isFinite(item.id)) return false;

  const price = Number(item.price);
  if (!Number.isFinite(price) || price < 0) return false;

  if (!Number.isInteger(qty) || qty <= 0) return false;

  return true;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    const trimmed = req.body.trim();
    if (!trimmed) return {};
    return JSON.parse(trimmed);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

export default async function handler(req, res) {
  const requestId = makeRequestId();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('x-request-id', requestId);

  // Allow preflight
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    console.warn(`[${requestId}] method not allowed`, req.method);
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    const body = await readJsonBody(req);
    const cart = body.cart ?? [];
    const paymentMethod = body.paymentMethod ?? 'visa';
    const cardLast4 = body.cardLast4 ?? null;
    const cardExpiry = body.cardExpiry ?? null;

    // Never accept/store CVV
    // If frontend sends it by mistake, we ignore it.

    if (!Array.isArray(cart)) {
      return res.status(400).json({ error: 'cart must be an array', requestId });
    }
    if (!cart.every(isValidCartItem)) {
      return res.status(400).json({ error: 'invalid cart item', requestId });
    }

    // Compute total on server (don’t trust client total)
    const computedTotal = cart.reduce((sum, row) => {
      return sum + Number(row.item.price) * Number(row.quantity);
    }, 0);

    const sb = createSupabaseServerClient();
    if (!sb) {
      console.error(`[${requestId}] Supabase server client not configured`);
      return res.status(500).json({ error: 'Database not configured', requestId });
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
      return res.status(500).json({ error: orderError.message, requestId });
    }

    const orderId = orderData?.id;
    if (!orderId) {
      console.error(`[${requestId}] orders insert returned no id`, orderData);
      return res.status(500).json({ error: 'Order insert returned no id', requestId });
    }

    // Insert order items
    if (cart.length) {
      const items = cart.map((row) => ({
        order_id: orderId,
        menu_item_id: row.item.id,
        quantity: Number(row.quantity),
        price: Number(row.item.price),
      }));

      const { error: itemsError } = await sb.from('order_items').insert(items);

      if (itemsError) {
        console.error(`[${requestId}] order_items insert error`, itemsError);
        const { error: rollbackError } = await sb.from('orders').delete().eq('id', orderId);
        if (rollbackError) {
          console.error(`[${requestId}] rollback failed`, rollbackError);
        } else {
          console.info(`[${requestId}] rollback succeeded`);
        }
        return res.status(500).json({ error: itemsError.message, requestId });
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
    return res.status(500).json({ error: 'Internal error', requestId, detail: err?.message || String(err) });
  }
}
