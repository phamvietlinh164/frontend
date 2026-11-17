# Known limitations — frontend

Honest list of what the React SPA deliberately does not do, what is simplified,
and what I would implement next. The backend has its own list in
[`../backend/KNOWN_LIMITATIONS.md`](../backend/KNOWN_LIMITATIONS.md).

## Deliberately out of scope (per the assignment)

- Pixel-perfect visual design (the UI is clean and functional, not branded).
- GIS maps and telemetry/time-series views (no such data is served).
- Authentication / per-user state (there is no login; the API is open).

## Simplifications & trade-offs

- **No virtualized tree or pagination.** Children, roots and search results are
  rendered in full. A substation with thousands of panels would want a
  virtualized tree, paired with server-side pagination on the API. Fine for the
  assignment's scale.
- **Whole-file upload.** The CSV is sent as one multipart request and the result
  rendered from the response; there is no chunked/resumable upload or progress
  streaming for very large files.
- **Search is debounced client input over a capped API result** (50 rows). No
  infinite scroll or client-side relevance re-ranking beyond what the API returns.
- **Theming is light/dark via CSS variables only.** No theme switcher UI or
  per-user preference persistence.
- **Frontend is not containerised.** The backend and Postgres run containerised
  (`docker compose up`); the frontend runs locally with Vite's dev server
  (`npm run dev`, with HMR). This is deliberate: the SPA is a **static** bundle
  whose production target is **S3 + CloudFront** (a CDN, not a container), so
  wrapping it in an nginx container just for local use would add a layer that does
  not exist in the real deployment. **Trade-off:** there is no single
  `docker compose up` for the *entire* stack — you run two processes (Compose for
  db + backend, `npm run dev` for the UI). A frontend `Dockerfile` + nginx +
  Compose service can be re-added in a few minutes if a one-command full stack is
  preferred (it existed earlier and was removed on purpose).

## Testing

- The frontend has a **Vitest + React Testing Library** suite (jsdom) covering the
  API client (`src/lib/api.test.ts`) and the key components (`Badges`,
  `ImportResults`, `SearchBar`, `AssetDetails`) — rendering, interactions and
  loading/empty/error states (`npm test`).
- **Still open:** a unit test for the `useAssetTree` hook (the async tree/reveal
  logic) and a **Playwright** end-to-end smoke test for the deep-link /
  expand-to-reveal path.
- No visual-regression testing.

## What I'd implement next (and why)

1. **Playwright E2E smoke test** — the tree-reveal and import flows are the most
   valuable user paths to lock down end-to-end.
2. **`useAssetTree` hook unit test** — the highest-logic, least-covered part of
   the client.
3. **Virtualized tree rendering** — paired with server-side pagination on the
   API, this is what carries the UI to large real datasets.
