# PROJECT KNOWLEDGE BASE

**Updated:** 2026-03-14
**Branch:** main

## OVERVIEW

SvelteKit 2 + Svelte 5 static site for MoneyWiz SQLite visualization.
SQLite ingestion is worker-only. Snapshot data is persisted in IndexedDB.

## STRUCTURE

```text
src/
  routes/
  components/
  lib/
    apis/             # bank APIs, pipelines, record APIs, SQLite client
    app/              # controllers, dashboard, filters, sessions, transaction utils
    charts/           # chart adapters, config, themes
    components/       # component class helpers, models
    currency/         # currency conversion, rates, models, store
    formatters/       # amount, category, date, transaction-type formatters
    loggers/          # logger models, constants
    notifications/    # notification models and store
    providers/        # storage providers (async storage, IndexedDB, OPFS)
    session/          # session models and persistence
    source/sqlite/    # worker client/protocol/runtime/backends/extractors/writers
    themes/           # theme constants, models, state, store
    transactions/     # classifier, importer, repository, models
    types/            # core shared types
    ui/               # UI exports (charts, notifications, themes)
    utils/            # utility aggregators
  utils/
    db/
    apis/
    states/
    stores/
    types/
```

## HARD RULES

1. SQLite parsing/extraction must run in worker thread only.
2. `src/components` and `src/routes` must never import `src/utils` directly.
3. `src/utils` can be imported only by `src/lib` or `src/utils`.
4. Non-test source files in `src/lib` and `src/utils` must stay `<= 300` LOC.
5. Prefer split folders with `index.ts` aggregators for multi-operation modules.

## REQUIRED REFERENCE DOCS

- `docs/ARCHITECTURE.md` — module boundaries, dependency rules, storage model, file splitting standard
- `docs/schema/README.md` — SQLite schema, data parser rules, SQL queries

## COMMANDS

```bash
bun run dev
bun run fix
bun run check
bun run build
bun run test:unit
bun run test:e2e
```

## QUALITY GATES

`bun run check` must pass:

- format check
- lint check
- import boundary check
- LOC check
- svelte-check

## NOTES

- `data/` is local-only and gitignored.
- Do not depend on `static/data` or `static/database` in runtime/tests.
- Use generated fixtures for tests.
