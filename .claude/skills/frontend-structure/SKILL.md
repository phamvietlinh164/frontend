---
name: frontend-structure
description: Conventions for the frontend code — API client, tree-state hook, components, routing, and required loading/empty/error states. Use when adding or changing UI, data fetching, or types.
---

# Frontend structure & conventions

## Data flow

- **All** network access goes through `src/lib/api.ts` (base `/api`). Never call
  `fetch` directly from a component or hardcode a host. `ApiError` exposes the
  backend's message + status.
- `src/types.ts` mirrors the backend JSON shapes (`Asset`, `AssetDetail`,
  `ImportResult`, enums). When the API changes, update `types.ts` **and** `api.ts`
  together.
- The hierarchy tree state lives in `src/lib/useAssetTree.ts`: `roots`,
  `childrenCache`, `expanded`, `loadingIds`, plus `toggle`, `loadChildren`,
  `revealPath` (expand to an asset's ancestors) and `reload`.

## Components (`src/components/`)

Small and reusable: `AssetTree` (+ recursive `TreeNode`), `AssetDetails`,
`SearchBar` (debounced, optional type filter), `UploadPanel` (drag/drop + POST),
`ImportResults` (totals + per-row rejection table), `Badges` (`TypeBadge`,
`StatusBadge`).

## Routing

`src/App.tsx` → `ExplorerPage` at `/` and `/assets/:assetId`. The selected asset
is **URL state**, so refresh and deep links restore the view. Selecting anything
calls `navigate('/assets/:id')`; `ExplorerPage` then `revealPath`s the ancestors.

## Rules

- Every async surface must render explicit **loading**, **empty**, and **error**
  states (see `AssetTree`, `AssetDetails`, `SearchBar`).
- Only `SUBSTATION` and `SWITCHBOARD` are expandable (`EXPANDABLE_TYPES`); other
  types are leaves — don't show an expander for them.
- Keep child grouping/ordering aligned with the backend (`TRANSFORMER`,
  `LV_BOARD`, `SWITCHBOARD`, `SWITCHBOARD_PANEL`).
- Theme via CSS variables in `src/styles.css` (light + dark). No CSS framework.

## Testing (Vitest + React Testing Library)

- Runner: `npm test` (jsdom). Config in `vitest.config.ts`; jest-dom matchers
  registered in `src/test/setup.ts`; typed fixtures in `src/test/factories.ts`
  (`makeAsset`, `makeDetail`).
- Pattern: mock the API module with `vi.mock('../lib/api', ...)` so components are
  tested in isolation; assert rendered output and user interactions, not internals.
- Existing specs: `src/lib/api.test.ts` (client URL/shape/error handling),
  `components/*.test.tsx` (Badges, ImportResults, SearchBar, AssetDetails).
- Not yet covered: `src/lib/useAssetTree.ts` and an end-to-end Playwright smoke
  test — add these when touching tree/reveal logic.

## Checklist before done

- [ ] `npm run typecheck`, `npm test` and `npm run build` pass.
- [ ] Types + API client updated together for any backend contract change.
- [ ] New async UI has loading/empty/error states, with a Vitest test where practical.
