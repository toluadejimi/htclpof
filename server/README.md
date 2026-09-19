# Highlight Consulting — Proof of Funds API

A real backend for the Proof of Funds portal: PostgreSQL database, cookie-based JWT authentication (bcrypt-hashed passwords), applications, document uploads, and public document verification. No demo/sample data — every record comes from real signups and submissions.

## Setup

1. Create a PostgreSQL database (locally, Docker, or a managed provider).
   ```bash
   createdb highlight_pof
   ```
2. Copy the environment template and fill in real values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL`: connection string for your Postgres database.
   - `JWT_SECRET`: a long random string (e.g. `openssl rand -hex 32`).
   - `COOKIE_SECURE`: set to `true` once served over HTTPS in production.
3. Install dependencies and run migrations:
   ```bash
   npm install
   npm run migrate
   ```
4. Start the API:
   ```bash
   npm run dev
   ```
   The API listens on `http://localhost:4000` by default.

## Endpoints

- `POST /api/auth/register` — create an account
- `POST /api/auth/login` / `POST /api/auth/logout`
- `GET /api/auth/me` — current session user
- `POST /api/applications` — submit an application (auth required)
- `GET /api/applications/mine` — the signed-in customer's applications
- `GET /api/applications/:id` — application detail + timeline (owner or admin)
- `GET /api/applications` — admin list with `status`/`search` filters
- `PATCH /api/applications/:id/status` — admin status update
- `GET /api/applications/stats/summary` — admin dashboard aggregates
- `POST /api/documents/:applicationId` — upload a document (`multipart/form-data`, field `file`, plus `docType`)
- `GET /api/documents/application/:applicationId` — list documents for an application
- `GET /api/documents/:id/file` — download a document (owner or admin only)
- `GET /api/verify/:reference` — public verification for approved/completed applications only

## Creating the first admin

There is no public admin signup. Register a normal account, then promote it directly in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';
```

## Security notes

- Passwords are hashed with bcrypt (cost 12); plaintext passwords are never stored or logged.
- Sessions use httpOnly, `SameSite=Lax` cookies — set `COOKIE_SECURE=true` behind HTTPS.
- All application/document routes are authorization-checked against the owning user or admin role.
- Uploaded file types are restricted to PDF/JPEG/PNG, capped at 5MB, and stored outside of the web root; downloads are only served through an authenticated, authorized route.
- All SQL queries use parameterized statements.
