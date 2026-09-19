# Highlight Consulting — Proof of Funds API

A real backend for the Proof of Funds portal: MySQL database, cookie-based JWT authentication (bcrypt-hashed passwords), applications, document uploads, and public document verification. No demo/sample data — every record comes from real signups and submissions.

## Local setup

1. Create a MySQL database (locally, or via cPanel's "MySQL Databases").
2. Copy the environment template and fill in real values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL`: `mysql://user:password@host:3306/dbname`
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

## Deploying on cPanel (Setup Node.js App)

Since `highlightconsult.com` hosting supports Node.js apps via cPanel:

1. In cPanel → **Software** → **Setup Node.js App** → **Create Application**.
   - Application root: the folder you upload this `server/` code into (e.g. `pof-api`).
   - Application startup file: `src/index.js`.
   - Node version: 18 or later.
2. In cPanel → **Databases** → **MySQL Databases**, create a database + user, and grant the user full privileges on it. Note the resulting database name/user/password (cPanel usually prefixes them with your account username).
3. In the Node.js App's **Environment Variables** section (or a `.env` file in the app root), set:
   - `DATABASE_URL=mysql://<db_user>:<db_password>@localhost:3306/<db_name>`
   - `JWT_SECRET` — a long random value
   - `JWT_EXPIRES_IN=7d`
   - `COOKIE_SECURE=true`
   - `CLIENT_ORIGIN=https://highlightconsult.com` (the origin serving the portal, e.g. if the portal lives at `https://highlightconsult.com/pof/`)
   - `UPLOAD_DIR=/home/<cpanel_user>/pof-uploads` (a writable path outside the web root)
4. Use the cPanel Node.js App's "Run NPM Install" button, then open its terminal and run `npm run migrate` once to create the tables.
5. Start/restart the application from the cPanel Node.js App page. cPanel proxies a public URL (or your own subdomain/path) to it — use that URL as `VITE_API_URL` when building the portal.

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
