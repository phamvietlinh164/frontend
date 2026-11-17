# Frontend architecture & trade-off note

Design and trade-offs for the React + TypeScript SPA. The Go API lives in a
**separate repository** (`../backend`) and has its own architecture note; this
document covers the client, its data flow and how it is served.

## Overview

```
Browser ──HTTP──▶ React SPA (static) ──/api──▶ Go API ──pgx──▶ PostgreSQL
```

The browser only ever talks to **one origin**. The app calls the relative `/api`
base; that path is routed to the Go service by Vite's dev proxy in local
development, and by CloudFront when the SPA is hosted on S3 (see
[Deployment topology](#deployment-topology)). The client never hardcodes a
backend host, so the same build runs in every environment.

## Key decisions & trade-offs

- The tree is **lazy-loaded**: roots first, children fetched on expand and
  cached. Arriving at an asset via search or a deep link fetches its ancestors
  and expands exactly that path (`revealPath`).
- The selected asset is **URL state** (`/assets/:assetId`), so refresh and direct
  navigation restore the view; the Vite dev server (local) — or CloudFront error
  responses (S3 deploy) — serves `index.html` for client routes.
- Every async surface has explicit **loading / empty / error** states.
- All network access goes through one typed client (`src/lib/api.ts`, base
  `/api`); `ApiError` carries the backend's message and status. `src/types.ts`
  mirrors the backend JSON shapes and is kept in sync with the client.
- Components are small and reusable (`TypeBadge`, `StatusBadge`, `AssetTree`,
  `AssetDetails`, `SearchBar`, `UploadPanel`, `ImportResults`); theming is via CSS
  variables (light + dark), with no CSS framework.
- **Minimal dependencies:** React, React DOM, React Router only. The build is Vite
  5; Node 20 LTS is the canonical toolchain (`.nvmrc`), with Node 18+ supported.

## Deployment topology

The SPA always calls the relative `/api` base, with **no code change** between
environments.

- **Local development.** `npm run dev` serves the SPA on `:5173` and Vite's dev
  server proxies `/api` to the Go API on `localhost:8080` (the backend is run with
  `docker compose up` from the parent folder). Vite also serves `index.html` for
  client routes, so deep links and refresh work in dev.
- **Static frontend on S3 + CloudFront (production).** The Vite build (`dist/`) is
  uploaded to a **private** S3 bucket; CloudFront sits in front as CDN + TLS.

The frontend is intentionally **not containerised**: its production target is
static hosting (S3 + CloudFront), not a container, so local development uses Vite's
dev server rather than duplicating an nginx layer that the real deployment never
runs. The backend and database still run as containers via `docker compose up`.

For the S3 model, CloudFront uses **two origins on one distribution** so the
browser still sees a single origin:

```
                  ┌───────────────▶ S3 (private, via OAC)     ← default: static dist/
Browser ─▶ CloudFront
                  └─ /api/* ───────▶ Backend (ALB / API GW) ─▶ Go API ─▶ PostgreSQL
```

CloudFront does the two jobs that Vite's dev server handles automatically in local
development:

1. **API routing.** A cache behavior for `/api/*` targets the backend origin; the
   default behavior targets S3. Because both sit behind the same CloudFront
   domain, the frontend keeps calling `/api` **relatively** — no `VITE_API_BASE`,
   no CORS, and `src/lib/api.ts` is untouched.
2. **SPA fallback.** CloudFront **custom error responses** map S3's `403`/`404`
   (a missing object key) to `/index.html` with HTTP `200` — the production
   equivalent of what the Vite dev server does for client routes. Without this, a
   deep link or refresh on `/assets/<id>` would return S3's error instead of the
   app.

Operational notes: the S3 bucket stays private and is read only by CloudFront via
**Origin Access Control (OAC)**; static assets cache with a long TTL (Vite's
content-hashed filenames make this safe), while the `/api/*` behavior disables
caching and forwards the headers the API needs. The backend keeps running as a
container behind an ALB or API Gateway, and the database is unchanged.

**Trade-off.** An alternative — CloudFront for S3 only, with the SPA calling the
backend directly at e.g. `api.example.com` via a build-time `VITE_API_BASE` —
matches the literal "browser → CloudFront → S3" path more closely, but introduces
a second browser-facing origin and the CORS configuration that comes with it. The
two-origin approach above is preferred because it preserves the single-origin
principle and needs no code change.

## What I'd do next

See [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md). The highest-value frontend
steps are a virtualized tree for wide substations (paired with server-side
pagination on the API) and an end-to-end Playwright smoke test for the deep-link /
expand-to-reveal path.
