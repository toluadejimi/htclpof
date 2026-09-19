import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const SETTINGS_KEY = 'payment_config';

const DEFAULTS = {
  feeAmount: 0,
  feeCurrency: 'NGN',
  bankName: '',
  accountName: '',
  accountNumber: '',
  instructions: ''
};

async function readSettings() {
  const result = await query('SELECT value FROM settings WHERE key_name = $1', [SETTINGS_KEY]);
  if (!result.rows[0]) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(result.rows[0].value) };
  } catch {
    return DEFAULTS;
  }
}

// Public — the Apply flow needs the fee amount and payment instructions before login isn't
// required, but only non-sensitive display fields are returned here.
router.get('/payment', async (req, res) => {
  res.json(await readSettings());
});

router.put('/payment', requireAuth, requireAdmin, async (req, res) => {
  const { feeAmount, feeCurrency, bankName, accountName, accountNumber, instructions } = req.body || {};
  const numericFee = Number(feeAmount);
  if (!Number.isFinite(numericFee) || numericFee < 0) {
    return res.status(400).json({ error: 'Fee amount must be a non-negative number.' });
  }
  const value = {
    feeAmount: numericFee,
    feeCurrency: (feeCurrency || 'NGN').toString().slice(0, 10),
    bankName: (bankName || '').toString().slice(0, 255),
    accountName: (accountName || '').toString().slice(0, 255),
    accountNumber: (accountNumber || '').toString().slice(0, 100),
    instructions: (instructions || '').toString().slice(0, 2000)
  };
  await query(
    `INSERT INTO settings (key_name, value) VALUES ($1, $2)
     ON DUPLICATE KEY UPDATE value = VALUES(value)`,
    [SETTINGS_KEY, JSON.stringify(value)]
  );
  res.json(value);
});

export default router;
