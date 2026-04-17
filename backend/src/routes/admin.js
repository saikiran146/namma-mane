import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireAdmin);

// Orders
router.get('/orders', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC');
    for (const order of rows) {
      const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = items;
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const { rows } = await query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products
router.get('/products', async (req, res) => {
  const { rows } = await query('SELECT * FROM products ORDER BY category, name');
  res.json(rows);
});

router.post('/products', async (req, res) => {
  const { name, category, price, unit, description, emoji } = req.body;
  if (!name || !category || !price) return res.status(400).json({ error: 'Name, category, price required' });
  try {
    const { rows } = await query(
      'INSERT INTO products (name, category, price, unit, description, emoji) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, category, price, unit || 'kg', description || '', emoji || '🌿']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  const { name, category, price, unit, description, emoji, in_stock } = req.body;
  try {
    const { rows } = await query(
      `UPDATE products SET name=$1, category=$2, price=$3, unit=$4, description=$5, emoji=$6, in_stock=$7
       WHERE id=$8 RETURNING *`,
      [name, category, price, unit, description, emoji, in_stock, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const [orders, users, products, revenue] = await Promise.all([
      query('SELECT COUNT(*) FROM orders'),
      query("SELECT COUNT(*) FROM users WHERE role = 'customer'"),
      query('SELECT COUNT(*) FROM products'),
      query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status != 'cancelled'")
    ]);
    res.json({
      totalOrders: parseInt(orders.rows[0].count),
      totalCustomers: parseInt(users.rows[0].count),
      totalProducts: parseInt(products.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
