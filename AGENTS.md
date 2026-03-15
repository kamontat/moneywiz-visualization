# PROJECT KNOWLEDGE BASE

**Updated:** 2026-03-15
**Commit:** 50eefd0
**Branch:** main

## OVERVIEW

SvelteKit 2 + Svelte 5 static site for MoneyWiz SQLite visualization.
SQLite ingestion is worker-only. Snapshot data is persisted in IndexedDB.

## STRUCTURE

```text
src/
  routes/             # +layout.svelte, +page.svelte (dashboard), storage/
  components/         # Atomic Design: atoms → molecules → organisms
  lib/
    apis/             # bank APIs, pipelines, record APIs, SQLite client
    app/              # controllers, dashboard, filters, sessions
    charts/           # chart adapters, config, themes
    components/       # component class helpers, models
    currency/         # conversion, rates, models, store
    formatters/       # amount, category, date, transaction-type
    loggers/          # logger models, constants
    notifications/    # notification models and store
    providers/        # storage providers (IndexedDB, OPFS)
    session/          # session models and persistence
    source/sqlite/    # worker protocol/runtime/backends/extractors/writers
    themes/           # theme constants, models, state, store
    transactions/     # classifier, importer, repository, models
    types/            # core shared types
    ui/               # UI exports (charts, notifications, themes)
    utils/            # utility aggregators
  utils/
    db/               # IndexedDB abstractions
    apis/             # API helpers
    states/           # state management primitives
    stores/           # store schema and constants
    types/            # shared TS utility types
```

## HARD RULES

1. SQLite parsing/extraction must run in worker thread only.
2. `src/components` and `src/routes` must never import `src/utils` directly.
3. `src/utils` can be imported only by `src/lib` or `src/utils`.
4. Non-test source files in `src/lib` and `src/utils` must stay `<= 300` LOC.
5. Prefer split folders with `index.ts` aggregators for multi-operation modules.

## ANTI-PATTERNS

- Type suppression: `as any`, `@ts-ignore`, `@ts-expect-error`
- Empty catch blocks: `catch(e) {}`
- Deleting failing tests to pass CI
- Importing `$utils` from `$components` or routes

## REQUIRED REFERENCE DOCS

- `docs/ARCHITECTURE.md` — module boundaries, dependency rules, storage model
- `docs/schema/README.md` — SQLite schema, data parser rules, SQL queries

## COMMANDS

```bash
bun run dev          # Start dev server (port 5173)
bun run fix          # Auto-fix format + lint
bun run check        # All quality gates
bun run build        # Static build
bun run test:unit    # Vitest unit tests
bun run test:e2e     # Playwright e2e tests
```

## QUALITY GATES

`bun run check` must pass:

- format check (prettier)
- lint check (eslint)
- import boundary check
- LOC check (≤300 lines)
- svelte-check

## CONVENTIONS

- Tabs, no semicolons, single quotes (prettier)
- DaisyUI classes prefixed `d-`
- Underscore prefix ignores unused vars (`_unused`)
- COOP/COEP headers enabled in dev (for WASM/workers)

## NOTES

- `data/` is local-only and gitignored.
- Do not depend on `static/data` or `static/database` in runtime/tests.
- Use generated fixtures for tests.
- Two IndexedDB databases: `v1:app-db` (settings), `moneywiz-v3` (transactions).
