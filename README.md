# Highlight Consulting — Proof of Funds Portal

Full Proof of Funds application: customer/admin portal + API.

- [`portal/`](portal) — React + Vite frontend (customer signup/login, application flow, admin dashboard, public document verification).
- [`server/`](server) — Node/Express + PostgreSQL API (auth, applications, documents, verification).

## Quick start

1. **Database + API** — see [server/README.md](server/README.md): create a Postgres database, copy `.env.example` to `.env`, run migrations, `npm run dev`.
2. **Portal** — see [portal/README.md](portal/README.md): copy `.env.example` to `.env` pointing at the API, `npm run dev`.

No demo/seed data is included — accounts and applications are created through normal signup/use.

## Deploying (cPanel static hosting + Render API)

Your `pof.highlightconsult.com` cPanel hosting only serves static files and has no Node.js runtime, so the frontend and API deploy to two different places:

### 1. API + database on Render (free tier)

This repo includes a `render.yaml` Blueprint that provisions both the API and a managed Postgres database automatically:

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**, connect this GitHub repo (`toluadejimi/htclpof`).
2. Render reads `render.yaml`, creates the `htclpof-api` web service and `htclpof-db` Postgres database, and runs migrations on deploy.
3. Once deployed, note the API's URL, e.g. `https://htclpof-api.onrender.com`.
4. If you want it under your own domain (e.g. `api.highlightconsult.com`), add that as a custom domain on the Render service and point a CNAME record at it in your DNS.

### 2. Frontend on cPanel (static files)

1. Locally (or in CI), set the API URL and build:
   ```bash
   cd portal
   echo "VITE_API_URL=https://htclpof-api.onrender.com" > .env
   npm install
   npm run build
   ```
2. Upload the **contents** of `portal/dist/` (not the folder itself) into the cPanel document root for `pof.highlightconsult.com` — replacing the raw `portal/`/`server/` source folders that were uploaded there before. The document root should end up with `index.html`, `assets/`, and `images/` directly inside it.
3. Update `server/render.yaml`'s `CLIENT_ORIGIN` (or the Render dashboard env var) to `https://pof.highlightconsult.com` so the API's CORS/cookie settings accept requests from your live domain, then redeploy the API.

Do not upload the `portal/` or `server/` source folders themselves to cPanel — only the built `dist/` output belongs there.
