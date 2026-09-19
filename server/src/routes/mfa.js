import { Router } from 'express';
import { generateSecret, generateURI, verify as verifyTotp } from 'otplib';
import qrcode from 'qrcode';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const ISSUER = 'Highlight Consulting POF';

// Generates a new TOTP secret and returns it as a QR code (scan with Google
// Authenticator, Authy, etc.). Not enabled until confirmed via /enable.
router.post('/setup', requireAuth, async (req, res) => {
  const result = await query('SELECT email FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  const secret = await generateSecret();
  await query('UPDATE users SET mfa_secret = $1, mfa_enabled = 0 WHERE id = $2', [secret, req.user.id]);
  const otpauthUrl = await generateURI({ issuer: ISSUER, label: user.email, secret });
  const qrDataUrl = await qrcode.toDataURL(otpauthUrl);
  res.json({ secret, qrCode: qrDataUrl });
});

router.post('/enable', requireAuth, async (req, res) => {
  const { code } = req.body || {};
  const result = await query('SELECT mfa_secret FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user?.mfa_secret) {
    return res.status(400).json({ error: 'Run 2FA setup first to generate a secret.' });
  }
  const check = code && await verifyTotp({ secret: user.mfa_secret, token: String(code).trim() });
  if (!check?.valid) {
    return res.status(400).json({ error: 'Incorrect verification code.' });
  }
  await query('UPDATE users SET mfa_enabled = 1 WHERE id = $1', [req.user.id]);
  res.json({ ok: true });
});

router.post('/disable', requireAuth, async (req, res) => {
  const { code } = req.body || {};
  const result = await query('SELECT mfa_secret, mfa_enabled FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user?.mfa_enabled) {
    return res.status(400).json({ error: '2FA is not enabled.' });
  }
  const check = code && await verifyTotp({ secret: user.mfa_secret, token: String(code).trim() });
  if (!check?.valid) {
    return res.status(400).json({ error: 'Incorrect verification code.' });
  }
  await query('UPDATE users SET mfa_enabled = 0, mfa_secret = NULL WHERE id = $1', [req.user.id]);
  res.json({ ok: true });
});

export default router;
