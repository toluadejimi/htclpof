# Highlight Consulting Services Limited — Proof of Funds Portal

A React/Vite customer and admin portal for Proof of Funds applications, backed by the real API in [`../server`](../server).

## Included screens
- Public landing page
- Customer signup/login (real accounts, hashed passwords)
- Multi-step application flow (saved to the database)
- Document upload (stored server-side, access-controlled)
- Application list/search, tracking timeline
- Admin dashboard, applications list, and status updates
- Public document verification (only shows approved/completed applications)

## Run locally

Requirements: Node.js 18+, and the API in `../server` running (see its README for database setup).

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your API's URL
npm run dev
```

Then open the local Vite URL shown in the terminal. Create an account through the UI; there is no seeded/demo data — everything you see comes from what you submit.

## Build & deploy

```bash
npm run build
```

This produces a `dist/` folder built with a relative base path, so it can be deployed under any subpath (for example, copy its contents into a `pof/` folder alongside the main site so `services.html`'s "Get Funds now" button, linking to `pof/`, resolves correctly). Set `VITE_API_URL` (via `.env` before building) to the deployed API's public URL.

## Payments

The application review step currently does not collect payment — that integration (Paystack/Flutterwave) is intentionally left as a follow-up once live merchant keys are available.
