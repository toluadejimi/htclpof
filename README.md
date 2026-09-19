# Highlight Consulting — Proof of Funds Portal

Full Proof of Funds application: customer/admin portal + API.

- [`portal/`](portal) — React + Vite frontend (customer signup/login, application flow, admin dashboard, public document verification).
- [`server/`](server) — Node/Express + PostgreSQL API (auth, applications, documents, verification).

## Quick start

1. **Database + API** — see [server/README.md](server/README.md): create a Postgres database, copy `.env.example` to `.env`, run migrations, `npm run dev`.
2. **Portal** — see [portal/README.md](portal/README.md): copy `.env.example` to `.env` pointing at the API, `npm run dev`.

No demo/seed data is included — accounts and applications are created through normal signup/use.
