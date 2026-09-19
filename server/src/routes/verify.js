import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// Public verification — only exposes minimal, non-sensitive details.
router.get('/:reference', async (req, res) => {
  const result = await query(
    `SELECT reference, full_name, amount, currency, purpose, status, created_at
     FROM applications WHERE reference = $1 AND status IN ('approved', 'completed')`,
    [req.params.reference.trim()]
  );
  const application = result.rows[0];
  if (!application) {
    return res.status(404).json({ error: 'No verified document found for this reference number.' });
  }
  const [first, ...rest] = application.full_name.split(' ');
  const maskedName = `${first[0]}*** ${rest.join(' ')}`.trim();
  res.json({
    reference: application.reference,
    applicantName: maskedName,
    amount: Number(application.amount),
    currency: application.currency,
    purpose: application.purpose,
    issueDate: application.created_at,
    status: 'Valid'
  });
});

export default router;
