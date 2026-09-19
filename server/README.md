# Highlight Consulting — Proof of Funds API

A real backend for the Proof of Funds portal: MySQL database, cookie-based JWT authentication (bcrypt-hashed passwords), applications, document uploads, and public document verification. No demo/sample data — every record comes from real signups and submissions.

## Local setup

1. Create a MySQL database (locally, or via cPanel's "MySQL Databases").
2. Copy the environment template and fill in real values:
   ```bash
   cp .env.example .env
   ```
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: discrete database credentials (preferred — avoids URL-encoding issues with special characters in passwords). Alternatively set a single `DATABASE_URL=mysql://user:password@host:3306/dbname`.
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
   - `DB_HOST=localhost`, `DB_PORT=3306`, `DB_USER=<db_user>`, `DB_PASSWORD=<db_password>`, `DB_NAME=<db_name>`
   - `JWT_SECRET` — a long random value
   - `JWT_EXPIRES_IN=7d`
   - `COOKIE_SECURE=true`
   - `CLIENT_ORIGIN=https://highlightconsult.com` (the origin serving the portal, e.g. if the portal lives at `https://highlightconsult.com/pof/`)
   - `UPLOAD_DIR=./uploads` (relative to the app root; the app creates it automatically)

   Only set variables in **one** place (either the cPanel UI or `.env`) — cPanel's Environment Variables panel takes priority over `.env` and stale duplicate values there are a common source of confusing bugs.
4. Use the cPanel Node.js App's "Run NPM Install" button, then open its terminal and run `npm run migrate` once to create the tables.
5. Start/restart the application from the cPanel Node.js App page. cPanel proxies a public URL (or your own subdomain/path) to it — use that URL as `VITE_API_URL` when building the portal.

## Endpoints

- `POST /api/auth/register` — create an account
- `POST /api/auth/login` / `POST /api/auth/logout` — login returns `{mfaRequired:true, mfaToken}` instead of a session if the account has 2FA enabled
- `POST /api/auth/mfa/verify-login` — complete login with `{mfaToken, code}`
- `GET /api/auth/me` — current session user
- `POST /api/auth/change-password` — change your own password
- `POST /api/auth/mfa/setup` / `POST /api/auth/mfa/enable` / `POST /api/auth/mfa/disable` — admin-only TOTP 2FA (Google Authenticator compatible)
- `POST /api/applications` — submit an application (auth required)
- `GET /api/applications/mine` — the signed-in customer's applications
- `GET /api/applications/:id` — application detail + timeline (owner, staff, or admin)
- `GET /api/applications` — staff/admin list with `status`/`search` filters
- `PATCH /api/applications/:id/status` — staff/admin status update
- `GET /api/applications/stats/summary` — staff/admin dashboard aggregates
- `POST /api/documents/:applicationId` — upload a document (`multipart/form-data`, field `file`, plus `docType`)
- `GET /api/documents/application/:applicationId` — list documents for an application
- `GET /api/documents/:id/file` — download a document (owner, staff, or admin only)
- `GET /api/verify/:reference` — public verification for approved/completed applications only
- `GET /api/admin/team` / `POST /api/admin/team` / `PATCH /api/admin/team/:id` — admin-only: list, create, and activate/deactivate/reassign staff or admin accounts (new accounts get a one-time generated temporary password)
- `GET /api/settings/payment` (public) / `PUT /api/settings/payment` (admin-only) — the application fee amount/currency and bank payment details shown in the Apply flow

## Roles

- `customer` — can submit and track their own applications.
- `staff` — everything a customer can't: review/list all applications, update status. Cannot manage team members, 2FA policy, or payment settings.
- `admin` — everything staff can do, plus manage team members (`/api/admin/team`), their own 2FA, and payment/fee settings.

## Creating the first admin

There is no public admin signup. Register a normal account, then promote it directly in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';
```
After that, the admin can create further staff/admin accounts from the portal's Team page instead of touching the database again.

## Security notes

- Passwords are hashed with bcrypt (cost 12); plaintext passwords are never stored or logged.
- Sessions use httpOnly, `SameSite=Lax` cookies — set `COOKIE_SECURE=true` behind HTTPS.
- Every authenticated request re-checks the user's active/role status in the database, so deactivating an account or changing its role takes effect immediately (not just at token expiry).
- Admin 2FA uses TOTP (RFC 6238) — no secrets are sent to any third party; codes are generated/verified locally against the stored secret.
- All application/document routes are authorization-checked against the owning user, staff, or admin role.
- Uploaded file types are restricted to PDF/JPEG/PNG, capped at 5MB, and stored outside of the web root; downloads are only served through an authenticated, authorized route.
- All SQL queries use parameterized statements.
