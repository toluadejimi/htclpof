# Highlight Consulting — Proof of Funds Portal

Full Proof of Funds application: customer/admin portal + API.

- [`portal/`](portal) — React + Vite frontend (customer signup/login, application flow, admin dashboard, public document verification).
- [`server/`](server) — Node/Express + PostgreSQL API (auth, applications, documents, verification).

## Quick start

1. **Database + API** — see [server/README.md](server/README.md): create a MySQL database, copy `.env.example` to `.env`, run migrations, `npm run dev`.
2. **Portal** — see [portal/README.md](portal/README.md): copy `.env.example` to `.env` pointing at the API, `npm run dev`.

No demo/seed data is included — accounts and applications are created through normal signup/use.

## Deploying on cPanel (highlightconsult.com)

Both pieces deploy to the same cPanel hosting account:

### 1. API — cPanel "Setup Node.js App"

Full steps are in [server/README.md](server/README.md#deploying-on-cpanel-setup-nodejs-app): create the Node.js app, create a MySQL database via cPanel, set the environment variables, run migrations once, and start the app. Note the URL cPanel assigns to the app.

### 2. Portal — static build under `/pof/`

```bash
cd portal
echo "VITE_API_URL=<the API URL from step 1>" > .env
npm install
npm run build
```

Upload the **contents** of `portal/dist/` (not the `portal/` folder itself) into a `pof` folder inside the `highlightconsult.com` document root, so it's reachable at `https://highlightconsult.com/pof/`. Do not upload the `portal/` or `server/` source folders as-is — only the built `dist/` output belongs on the static side.
