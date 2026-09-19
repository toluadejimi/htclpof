import crypto from 'node:crypto';
import { Router } from 'express';
import { query, pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const ALLOWED_STATUSES = ['submitted', 'under_review', 'needs_information', 'processing', 'approved', 'rejected', 'completed'];
const ALLOWED_PURPOSES = ['Study Abroad', 'Immigration', 'Business', 'Travel', 'Medical'];

function serialize(row) {
  return {
    id: row.id,
    reference: row.reference,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    nationality: row.nationality,
    idType: row.id_type,
    idNumber: row.id_number,
    phone: row.phone,
    email: row.email,
    amount: Number(row.amount),
    currency: row.currency,
    purpose: row.purpose,
    destination: row.destination,
    intendedUse: row.intended_use,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function nextReference() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("UPDATE counters SET value = LAST_INSERT_ID(value + 1) WHERE name = 'application_ref'");
    const [rows] = await conn.query('SELECT LAST_INSERT_ID() AS n');
    await conn.commit();
    const year = new Date().getFullYear();
    const n = String(rows[0].n).padStart(6, '0');
    return `HCS-${year}-${n}`;
  } finally {
    conn.release();
  }
}

// Create a new application (authenticated customer)
router.post('/', requireAuth, async (req, res) => {
  const { fullName, dateOfBirth, nationality, idType, idNumber, phone, email, amount, currency, purpose, destination, intendedUse } = req.body || {};
  if (!fullName || !amount || !purpose) {
    return res.status(400).json({ error: 'Full name, amount, and purpose are required.' });
  }
  if (!ALLOWED_PURPOSES.includes(purpose)) {
    return res.status(400).json({ error: 'Invalid purpose value.' });
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }
  const reference = await nextReference();
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO applications
      (id, reference, user_id, full_name, date_of_birth, nationality, id_type, id_number, phone, email, amount, currency, purpose, destination, intended_use, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'submitted')`,
    [id, reference, req.user.id, fullName, dateOfBirth || null, nationality || null, idType || null, idNumber || null, phone || null, email || null,
      numericAmount, currency || 'USD', purpose, destination || null, intendedUse || null]
  );
  const created = await query('SELECT * FROM applications WHERE id = $1', [id]);
  const application = created.rows[0];
  await query(
    `INSERT INTO application_events (id, application_id, status, note) VALUES ($1, $2, 'submitted', 'Application submitted')`,
    [crypto.randomUUID(), application.id]
  );
  res.status(201).json({ application: serialize(application) });
});


// List the authenticated customer's applications
router.get('/mine', requireAuth, async (req, res) => {
  const result = await query('SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  res.json({ applications: result.rows.map(serialize) });
});

// Get a single application (owner or admin)
router.get('/:id', requireAuth, async (req, res) => {
  const result = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
  const application = result.rows[0];
  if (!application) return res.status(404).json({ error: 'Application not found' });
  if (application.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to view this application' });
  }
  const events = await query('SELECT status, note, created_at FROM application_events WHERE application_id = $1 ORDER BY created_at ASC', [req.params.id]);
  res.json({ application: serialize(application), events: events.rows });
});

// Admin: list all applications with optional status/search filters
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { status, search } = req.query;
  const clauses = [];
  const params = [];
  if (status && ALLOWED_STATUSES.includes(status)) {
    params.push(status);
    clauses.push(`status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    clauses.push(`reference LIKE $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await query(`SELECT * FROM applications ${where} ORDER BY created_at DESC`, params);
  res.json({ applications: result.rows.map(serialize) });
});

// Admin: update application status
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status, note } = req.body || {};
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }
  await query('UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);
  const updated = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
  const application = updated.rows[0];
  if (!application) return res.status(404).json({ error: 'Application not found' });
  await query('INSERT INTO application_events (id, application_id, status, note) VALUES ($1, $2, $3, $4)', [crypto.randomUUID(), application.id, status, note || null]);
  res.json({ application: serialize(application) });
});

// Admin: aggregate stats for dashboard
router.get('/stats/summary', requireAuth, requireAdmin, async (req, res) => {
  const totals = await query(`
    SELECT status, count(*) AS count FROM applications GROUP BY status
  `);
  const monthly = await query(`
    SELECT DATE_FORMAT(created_at, '%b') AS month, count(*) AS count
    FROM applications
    WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
    ORDER BY DATE_FORMAT(created_at, '%Y-%m')
  `);
  const byStatus = totals.rows.map((r) => ({ status: r.status, count: Number(r.count) }));
  const monthlyRows = monthly.rows.map((r) => ({ month: r.month, count: Number(r.count) }));
  res.json({ byStatus, monthly: monthlyRows });
});

export default router;
