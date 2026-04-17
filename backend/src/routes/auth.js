import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });
  try {
    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      'INSERT INTO users (name, email, password_hash, phone) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
      [name, email, hash, phone || null]
    );
    const token = jwt.sign({ id: rows[0].id, email, role: rows[0].role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const { password_hash, ...user } = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query('SELECT id, name, email, phone, address, role FROM users WHERE id = $1', [decoded.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
