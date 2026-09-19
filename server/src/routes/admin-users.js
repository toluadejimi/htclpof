import crypto from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const TEAM_ROLES = ['staff', 'admin'];

function serialize(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isActive: !!row.is_active,
    mfaEnabled: !!row.mfa_enabled,
    createdAt: row.created_at
  };
}

function generateTempPassword() {
  return crypto.randomBytes(9).toString('base64url'); // 12 chars, URL-safe
}

// List team members (staff/admin) — customers are managed separately.
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const result = await query(
    "SELECT * FROM users WHERE role IN ('staff', 'admin') ORDER BY created_at DESC"
  );
  res.json({ users: result.rows.map(serialize) });
});

// Create a new team member with a one-time temporary password.
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { fullName, email, role } = req.body || {};
  if (!fullName || !email || !TEAM_ROLES.includes(role)) {
    return res.status(400).json({ error: "Full name, email, and a role of 'staff' or 'admin' are required." });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO users (id, full_name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, $4, $5, 1)`,
    [id, fullName.trim(), normalizedEmail, passwordHash, role]
  );
  res.status(201).json({
    user: serialize({ id, full_name: fullName.trim(), email: normalizedEmail, role, is_active: 1, mfa_enabled: 0, created_at: new Date() }),
    tempPassword
  });
});

// Activate/deactivate or change a team member's role.
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { role, isActive } = req.body || {};
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own access here.' });
  }
  const existing = await query("SELECT * FROM users WHERE id = $1 AND role IN ('staff','admin')", [req.params.id]);
  const target = existing.rows[0];
  if (!target) return res.status(404).json({ error: 'Team member not found' });

  const nextRole = role && TEAM_ROLES.includes(role) ? role : target.role;
  const nextActive = typeof isActive === 'boolean' ? (isActive ? 1 : 0) : target.is_active;
  await query('UPDATE users SET role = $1, is_active = $2 WHERE id = $3', [nextRole, nextActive, req.params.id]);
  const updated = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  res.json({ user: serialize(updated.rows[0]) });
});

export default router;
