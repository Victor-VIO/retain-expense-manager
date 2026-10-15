import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/client.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { HttpError } from '../utils.js';

const router = Router();

const toUser = (row) => ({
  id: Number(row.id),
  name: row.name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at,
});

// POST /api/auth/register – new accounts are always normal users
router.post('/register', async (req, res) => {
  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password ?? '';

  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Please enter a valid email address');
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length) throw new HttpError(409, 'An account with this email already exists');

  const hash = await bcrypt.hash(password, 10);
  const result = await db.execute({
    sql: `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?) RETURNING *`,
    args: [name, email, hash],
  });
  const user = toUser(result.rows[0]);
  res.status(201).json({ token: signToken(user), user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password ?? '';
  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  const row = result.rows[0];
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    throw new HttpError(401, 'Incorrect email or password');
  }
  const user = toUser(row);
  res.json({ token: signToken(user), user });
});

// GET /api/auth/me – used by the frontend to restore a session
router.get('/me', requireAuth, async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [req.user.id] });
  if (!result.rows.length) throw new HttpError(401, 'Account no longer exists');
  res.json({ user: toUser(result.rows[0]) });
});

export default router;
