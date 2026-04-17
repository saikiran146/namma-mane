import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  const { items, delivery_address, notes, guest_name, guest_email, guest_phone } = req.body;
  if (!items?.length || !delivery_address) return res.status(400).json({ error: 'Items and delivery address required' });

  const token = req.headers.authorization?.split(' ')[1];
  let userId = null;
  if (token) {
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {}
  }

  if (!userId && (!guest_name || !guest_email || !guest_phone)) {
    return res.status(400).json({ error: 'Guest name, email, and phone required for guest checkout' });
  }

  try {
    const productIds = items.map(i => i.product_id);
    const { rows: products } = await query(
      'SELECT id, name, price FROM products WHERE id = ANY($1)',
      [productIds]
    );
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    let total = 0;
    const validatedItems = items.map(item => {
      const product = productMap[item.product_id];
      if (!product) throw new Error(`Product not found: ${item.product_id}`);
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      return { ...item, product_name: product.name, price: product.price };
    });

    const { rows: [order] } = await query(
      `INSERT INTO orders (user_id, guest_name, guest_email, guest_phone, delivery_address, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, guest_name || null, guest_email || null, guest_phone || null, delivery_address, total, notes || null]
    );

    for (const item of validatedItems) {
      await query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES ($1,$2,$3,$4,$5)',
        [order.id, item.product_id, item.product_name, item.quantity, item.price]
      );
    }

    res.status(201).json({ ...order, items: validatedItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const { rows: orders } = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    for (const order of orders) {
      const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
    res.json({ ...rows[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
