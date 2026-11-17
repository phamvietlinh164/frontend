# AI development journal — frontend

This project was built with an agentic coding tool. I remain responsible for
every design and implementation decision recorded here; this log describes how I
used the tool and where my own judgement overrode or corrected it. This file
covers the **React + TypeScript SPA**; the backend has its own journal in
[`../backend/AI_JOURNAL.md`](../backend/AI_JOURNAL.md).

## Tools and models

- **Tool:** Claude Code (Anthropic's CLI coding agent).
- **Model:** Claude Opus 4.8.
- **Human environment:** macOS, Docker. Local Node was 18 (LTS at the time of my
  install); I standardized the frontend toolchain on **Node 20 LTS** (`.nvmrc`),
  with Node 18+ still supported (Vite 5). The frontend runs locally with
  `npm run dev` and is not containerised.

## Planning: how I sequenced the frontend

I built the frontend only after the API contract was proven, and worked from the
data layer outward so every component consumed a typed, tested client:

1. **Typed API client first** (`src/lib/api.ts`) over the relative `/api` base,
   with `ApiError` carrying the backend's message, and `src/types.ts` mirroring
   the backend JSON shapes.
2. **Tree-state hook** (`src/lib/useAssetTree.ts`) — roots, a children cache, the
   expanded set, and `revealPath` to expand to an asset's ancestors for search /
   deep-link arrivals.
3. **Components** (tree, details, search, upload, import results) kept small and
   reusable, then the page/routing (`ExplorerPage`, `/assets/:assetId` as URL
   state), then styling with explicit loading/empty/error states.
4. **Verification & tests** — static checks, an end-to-end pass, and later a
   Vitest + React Testing Library suite (see below).

## Three representative prompts / instructions

1. *"The app must talk only to a relative `/api` base — never a hardcoded host —
   so the same build works behind Vite's dev proxy and CloudFront."* — drove the
   single typed client and kept deployment flexible.
2. *"Every async surface needs explicit loading, empty and error states; the
   selected asset must live in the URL so refresh and deep links restore the
   view."* — drove the component contract and the routing design.
3. *"Add automated frontend tests: Vitest + React Testing Library, mocking the API
   module, covering the client and the key components including error states."* —
   drove the test suite that closed the frontend's main coverage gap.

## Correction: a suggestion I rejected / substantially revised

- **Node 18 → standardized on Node 20 LTS (corrected).** The first notes and
  tooling assumed Node 18 (what was on my machine). I standardized on **Node 20
  LTS** as the canonical toolchain — `.nvmrc` pins it — while keeping Node 18+
  working (Vite 5 supports it). This removed an ambiguity a reviewer would
  otherwise hit.
- **Closed the automated-test gap.** The frontend initially relied on `tsc` +
  `vite build` and manual exercise. I added a **Vitest + React Testing Library**
  suite (API client + `Badges`, `ImportResults`, `SearchBar`, `AssetDetails`,
  incl. loading/empty/error paths) rather than leaving the UI untested.

## Verification: how I reviewed and verified generated code

- **Static checks.** `tsc --noEmit` and `vite build` clean on every change.
- **Automated tests.** `npm test` (Vitest + RTL, jsdom): the API client's
  URL/shape/error handling and the key components' rendering and interactions,
  with the API module mocked so components are tested in isolation.
- **End-to-end verification.** Through `docker compose up --build` I exercised the
  real UI: CSV upload and the import-results table, lazy tree expansion,
  descendant counts, type-filtered search, and the **SPA deep-link + `/api`
  proxy** (refreshing `/assets/<id>` restores the view).
- **Reading, not just running.** I read the tree-state hook and the data flow to
  confirm the lazy-load/reveal logic matched the intended UX.

## Oversight: what the agent did poorly / where I stepped in

- **Toolchain version drift.** The agent initially carried the local Node 18
  assumption into the docs; I standardized on Node 20 LTS and made the Docker
  build the source of truth so the setup is reproducible.
- **Test coverage needed a push.** Static checks and manual exercise were not
  enough for a submission; I directed the agent to add the Vitest/RTL suite and
  to cover error states explicitly, not just happy paths.
- **Single-origin discipline.** I kept the client strictly on the relative `/api`
  base so the hosting story (Vite dev proxy / CloudFront) stays a deployment
  concern, not a code change.

## Approximate human working time

Roughly **1–2 hours** of active human time on the frontend — directing the
component/data design, making the Node-version call, reviewing the tree-state
logic, adding and reviewing the test suite, and running the end-to-end UI check.
This excludes unattended agent execution time (installs, builds, test runs).
