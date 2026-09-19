import jwt from 'jsonwebtoken';
import { query } from '../db.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Re-check against the database on every request so a deactivated/demoted
    // account loses access immediately instead of waiting for token expiry.
    const result = await query('SELECT id, email, role, is_active FROM users WHERE id = $1', [payload.id]);
    const user = result.rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Account is no longer active' });
    }
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Staff can review/manage applications; only admins can manage team members,
// payment settings, and MFA policy.
export function requireStaffOrAdmin(req, res, next) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
    return res.status(403).json({ error: 'Staff or admin access required' });
  }
  next();
}
