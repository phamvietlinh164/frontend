# Frontend — Grid Asset Explorer

React + TypeScript SPA (Vite) for uploading grid-asset CSVs and exploring the
substation→equipment hierarchy. Part of the `test_eastgate` take-home; the Go API
lives in a **separate repository** (`../backend`). The app talks only to `/api`.

## Architecture (where things live)

- `src/lib/api.ts` — typed fetch client; all calls go to the relative `/api` base
  (dev: Vite proxy; prod: CloudFront). `ApiError` carries the backend message.
- `src/lib/useAssetTree.ts` — hook owning the lazy-loaded tree: roots, children
  cache, expanded set, and `revealPath` (expand to an asset's ancestors).
- `src/types.ts` — shared types; must mirror the backend JSON shapes.
- `src/components/` — small reusable pieces: `AssetTree`, `AssetDetails`,
  `SearchBar`, `UploadPanel`, `ImportResults`, `Badges`.
- `src/pages/ExplorerPage.tsx` — composes the layout; selected asset is URL state
  (`/assets/:assetId`) so refresh/deep-links work.

## Commands

```bash
npm install
npm run dev         # Vite dev server on :5173, proxies /api to :8080
npm run typecheck   # tsc --noEmit
npm run build       # tsc --noEmit && vite build -> dist/
npm test            # Vitest + React Testing Library (jsdom), run once
npm run test:coverage
```

Node 20 LTS recommended (`.nvmrc`); Node 18+ works (Vite 5). Run the frontend
locally with `npm run dev`; the backend (db + API) runs from the parent folder via
`docker compose up --build`. The frontend is not containerised — in production it
is served as static files on S3 + CloudFront.

## Constraints / house rules

- The app communicates **only** with `/api` — never hardcode a backend host.
- Every async surface needs explicit **loading / empty / error** states.
- Keep components small and reusable; selected asset stays in the URL.
- `src/types.ts` must stay in sync with the backend response shapes; update it and
  `api.ts` together when the API changes.
- Minimal dependencies (React, React DOM, React Router). Justify additions.

## Definition of done

1. `npm run typecheck`, `npm test` and `npm run build` pass.
2. API/type changes mirrored in `src/types.ts` + `src/lib/api.ts`.
3. New async UI has loading/empty/error states, with a Vitest test where practical.

## GitNexus

This repo is indexed by GitNexus (managed section below). Run impact analysis
before editing a symbol; re-run `node .gitnexus/run.cjs analyze` after major
changes. See `.claude/skills/gitnexus-*` and the project skills in
`.claude/skills/` (`run-frontend`, `frontend-structure`).

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **frontend** (167 symbols, 354 relationships, 20 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/frontend/context` | Codebase overview, check index freshness |
| `gitnexus://repo/frontend/clusters` | All functional areas |
| `gitnexus://repo/frontend/processes` | All execution flows |
| `gitnexus://repo/frontend/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
