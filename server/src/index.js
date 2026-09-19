import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import documentRoutes from './routes/documents.js';
import verifyRoutes from './routes/verify.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/verify', verifyRoutes);

// Centralized error handler — avoids leaking internals to clients.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 400;
  res.status(status).json({ error: err.message || 'Something went wrong.' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Highlight POF API listening on port ${port}`));
