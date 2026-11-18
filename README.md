# Grid Asset Management — Frontend

A React + TypeScript single-page app for uploading grid-asset CSV files and
exploring the resulting substation → equipment hierarchy: an expandable tree,
per-asset details with descendant counts, and search by id/name/type with stable
deep-linkable routing.

- **Frontend:** React + TypeScript (Vite 5, React Router)
- **Backend:** Go API in a **separate repository** (`../backend`); the app talks
  only to the relative `/api` base.

> See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the design & trade-off note
> (incl. the S3 + CloudFront deployment topology), [`AI_JOURNAL.md`](AI_JOURNAL.md)
> for the agentic-development log, and [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)
> for what is deliberately left out.

---

## Quick start

The frontend runs locally with Vite's dev server. It needs the backend reachable
on `:8080` — start that first from the parent folder:

```bash
# 1. db + backend (from the repository's parent folder)
cd .. && docker compose up --build          # API on :8080

# 2. frontend dev server (in this folder, another terminal)
npm install
npm run dev                                  # SPA on http://localhost:5173
```

Open **http://localhost:5173**. Vite proxies `/api` to the backend; point it
elsewhere with `VITE_API_TARGET` (default `http://localhost:8080`).

**Prerequisites:** Node 20 LTS recommended (`.nvmrc`); Node 18+ works (Vite 5).
The frontend is not containerised — in production it is served as static files on
S3 + CloudFront (see [`ARCHITECTURE.md`](ARCHITECTURE.md#deployment-topology)).

---

## Using the app

1. **Upload** — click *Upload CSV* (top right) or drag a file onto it. You get a
   summary of **total / imported / rejected** rows, whether the data was
   **committed**, and a table of every rejection with its CSV row, asset ID and a
   human-readable reason.
2. **Explore** — the left pane is the hierarchy as an expandable tree (roots are
   substations). Selecting an asset shows its details, its immediate children
   grouped by type, and the count of each descendant type beneath it.
3. **Search** — search by exact or partial **asset ID or name**, optionally
   filtered by **type**. Selecting a result navigates to the asset, expands the
   tree to reveal its ancestors, highlights it, and shows its details.
4. **Deep links** — the selected asset lives in the URL (`/assets/<assetId>`), so
   refreshing or sharing a link restores the same view.

---

## Running tests

```bash
npm run typecheck     # tsc --noEmit
npm test              # Vitest + React Testing Library (jsdom), run once
npm run test:coverage # with a coverage report
npm run build         # production build (tsc --noEmit && vite build -> dist/)
```

Tests cover the API client (`src/lib/api.test.ts`) and the key components
(`Badges`, `ImportResults`, `SearchBar`, `AssetDetails`) — rendering,
interactions and loading/empty/error states. The parent folder's `Makefile` wraps
these: `make frontend-test`.

---

## Configuration (environment variables)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_TARGET` | `http://localhost:8080` | Backend target for the Vite dev proxy |

The app always calls the relative `/api` base; routing to the backend is a
deployment concern (Vite's dev proxy locally, or a CloudFront `/api/*` behavior on
S3) — see [`ARCHITECTURE.md`](ARCHITECTURE.md#deployment-topology).

---

## Project layout

```
src/
├── components/        # tree, details, search, upload, import results, badges
├── lib/               # typed API client (api.ts) + tree-state hook (useAssetTree.ts)
├── pages/             # route-level pages (ExplorerPage.tsx composes the layout)
├── test/              # Vitest setup + typed fixtures (factories)
├── types.ts           # shared types mirroring the backend JSON shapes
└── App.tsx            # router; renders ExplorerPage for the routes
```

See [`CLAUDE.md`](CLAUDE.md) for repository conventions and the definition of done.
