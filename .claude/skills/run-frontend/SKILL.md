---
name: run-frontend
description: Build, run and typecheck the React + TypeScript (Vite) frontend. Use when asked to start the dev server, build, or configure the frontend.
---

# Run the frontend

React + TypeScript SPA built with Vite. It talks only to the relative `/api` base.

## Prerequisites

Node 20 LTS recommended (`.nvmrc` pins 20); Node 18+ works with Vite 5.

## Commands

```bash
npm install
npm run dev         # Vite dev server on http://localhost:5173
npm run typecheck   # tsc --noEmit (no emit, type errors only)
npm run build       # tsc --noEmit && vite build  ->  dist/
npm run preview     # serve the production build locally
```

## API wiring

- **Dev:** `vite.config.ts` proxies `/api` → `http://localhost:8080` (override via
  `VITE_API_TARGET`). Start the backend first (see the backend repo).
- **Prod:** the static `dist/` is hosted on S3 + CloudFront; a CloudFront `/api/*`
  behavior routes to the backend, and custom error responses serve `index.html`
  for SPA routes. See the frontend `ARCHITECTURE.md` (Deployment topology).

## Running the backend it talks to

The frontend is not containerised. Start the backend (db + API) from the
**parent** folder (holds `docker-compose.yml`), then run the dev server here:

```bash
cd .. && docker compose up --build    # db + backend, API on :8080
# then, in this folder:
npm run dev                           # SPA on http://localhost:5173
```
