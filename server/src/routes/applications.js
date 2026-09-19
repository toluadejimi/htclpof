import { Router } from 'express';
import { query } from '../db.js';
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
  const year = new Date().getFullYear();
  const seq = await query("SELECT nextval('application_ref_seq') AS n");
  const n = String(seq.rows[0].n).padStart(6, '0');
  return `HCS-${year}-${n}`;
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
  const result = await query(
    `INSERT INTO applications
      (reference, user_id, full_name, date_of_birth, nationality, id_type, id_number, phone, email, amount, currency, purpose, destination, intended_use, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'submitted')
     RETURNING *`,
    [reference, req.user.id, fullName, dateOfBirth || null, nationality || null, idType || null, idNumber || null, phone || null, email || null,
      numericAmount, currency || 'USD', purpose, destination || null, intendedUse || null]
  );
  const application = result.rows[0];
  await query(
    `INSERT INTO application_events (application_id, status, note) VALUES ($1, 'submitted', 'Application submitted')`,
    [application.id]
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
    clauses.push(`reference ILIKE $${params.length}`);
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
  const result = await query('UPDATE applications SET status = $1, updated_at = now() WHERE id = $2 RETURNING *', [status, req.params.id]);
  const application = result.rows[0];
  if (!application) return res.status(404).json({ error: 'Application not found' });
  await query('INSERT INTO application_events (application_id, status, note) VALUES ($1, $2, $3)', [application.id, status, note || null]);
  res.json({ application: serialize(application) });
});

// Admin: aggregate stats for dashboard
router.get('/stats/summary', requireAuth, requireAdmin, async (req, res) => {
  const totals = await query(`
    SELECT status, count(*)::int AS count FROM applications GROUP BY status
  `);
  const monthly = await query(`
    SELECT to_char(date_trunc('month', created_at), 'Mon') AS month, count(*)::int AS count
    FROM applications
    WHERE created_at > now() - interval '12 months'
    GROUP BY date_trunc('month', created_at)
    ORDER BY date_trunc('month', created_at)
  `);
  res.json({ byStatus: totals.rows, monthly: monthly.rows });
});

export default router;
