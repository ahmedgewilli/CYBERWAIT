const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// List recent orders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, order_number, total, payment_method, card_last4, card_expiry, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  const { cart, paymentMethod, total, cardLast4 = null, cardExpiry = null } = req.body;
  
  try {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    
    // Create order (store masked card info only)
    const orderResult = await pool.query(
      'INSERT INTO orders (order_number, total, payment_method, card_last4, card_expiry, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [orderNumber, total, paymentMethod, cardLast4, cardExpiry, 'pending']
    );
    
    const orderRow = orderResult.rows[0];
    if (!orderRow || !orderRow.id) {
      console.error('backend orders: insert returned no row', orderResult.rows);
      return res.status(500).json({ error: 'insert returned no row', persisted: false });
    }

    const orderId = orderRow.id;
    
    // Insert order items
    for (const item of cart) {
      await pool.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.item.id, item.quantity, item.item.price]
      );
    }
    
    console.log('backend orders: persisted order id', orderId);
    res.json({ orderId, orderNumber: orderRow.order_number, status: 'pending', persisted: true, order: orderRow });
  } catch (error) {
    console.error('backend orders error:', error);
    res.status(500).json({ error: error.message, persisted: false });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    const itemsResult = await pool.query(
      `SELECT oi.*, mi.name, mi.image, mi.description 
       FROM order_items oi 
       JOIN menu_items mi ON oi.menu_item_id = mi.id 
       WHERE oi.order_id = $1`,
      [req.params.id]
    );
    
    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

