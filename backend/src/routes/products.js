import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    const sql = category
      ? 'SELECT * FROM products WHERE category = $1 AND in_stock = true ORDER BY name'
      : 'SELECT * FROM products WHERE in_stock = true ORDER BY category, name';
    const { rows } = await query(sql, category ? [category] : []);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
