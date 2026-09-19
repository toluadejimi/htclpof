import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone, role: user.role };
}

router.post('/register', async (req, res) => {
  const { fullName, email, phone, password } = req.body || {};
  if (!fullName || !email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Full name, email, and a password of at least 8 characters are required.' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, full_name, email, phone, role`,
    [fullName.trim(), normalizedEmail, phone || null, passwordHash]
  );
  const user = result.rows[0];
  const token = signToken(user);
  res.cookie('token', token, cookieOptions());
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = signToken(user);
  res.cookie('token', token, cookieOptions());
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

export default router;
