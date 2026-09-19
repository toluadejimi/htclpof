import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10);
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Only PDF, JPEG, or PNG files are allowed.'));
    }
    cb(null, true);
  }
});

async function assertOwnerOrAdmin(req, applicationId) {
  const result = await query('SELECT user_id FROM applications WHERE id = $1', [applicationId]);
  const application = result.rows[0];
  if (!application) return { ok: false, code: 404, error: 'Application not found' };
  if (application.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'staff') {
    return { ok: false, code: 403, error: 'Not authorized' };
  }
  return { ok: true };
}

router.post('/:applicationId', requireAuth, upload.single('file'), async (req, res) => {
  const check = await assertOwnerOrAdmin(req, req.params.applicationId);
  if (!check.ok) return res.status(check.code).json({ error: check.error });
  const { docType } = req.body || {};
  if (!req.file || !docType) {
    return res.status(400).json({ error: 'A document type and file are required.' });
  }
  await query(
    `INSERT INTO documents (id, application_id, doc_type, original_name, stored_path, mime_type, size_bytes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [crypto.randomUUID(), req.params.applicationId, docType, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size]
  );
  const created = await query(
    'SELECT id, doc_type, original_name, mime_type, size_bytes, uploaded_at FROM documents WHERE application_id = $1 ORDER BY uploaded_at DESC LIMIT 1',
    [req.params.applicationId]
  );
  res.status(201).json({ document: created.rows[0] });
});

router.get('/application/:applicationId', requireAuth, async (req, res) => {
  const check = await assertOwnerOrAdmin(req, req.params.applicationId);
  if (!check.ok) return res.status(check.code).json({ error: check.error });
  const result = await query(
    'SELECT id, doc_type, original_name, mime_type, size_bytes, uploaded_at FROM documents WHERE application_id = $1 ORDER BY uploaded_at DESC',
    [req.params.applicationId]
  );
  res.json({ documents: result.rows });
});

router.get('/:id/file', requireAuth, async (req, res) => {
  const result = await query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
  const doc = result.rows[0];
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  const check = await assertOwnerOrAdmin(req, doc.application_id);
  if (!check.ok) return res.status(check.code).json({ error: check.error });
  res.sendFile(path.resolve(UPLOAD_DIR, doc.stored_path));
});

export default router;
