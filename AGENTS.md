# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-23
**Branch:** main

## OVERVIEW

SvelteKit 2 + Svelte 5 static site for MoneyWiz SQLite visualization.
SQLite ingestion is worker-only. Snapshot data is persisted in IndexedDB.

## V2 STRUCTURE

```text
src/
  routes/
  components/
  lib/
    session/          # session workflow APIs and store
    source/sqlite/    # worker client/protocol/runtime
    ledger/           # classify/import/repository/models
    analytics/
    charts/
    currency/
    themes/
    formatters/
    loggers/
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

For any SQLite/database read/write/condition change, consult:

- `docs/DATA_PARSER.md`
- `docs/SQLITE_SCHEMA.md`

For V2 architecture decisions, also consult:

- `docs/ARCHITECTURE_V2.md`
- `docs/INGESTION_WORKER_PIPELINE.md`
- `docs/STORAGE_MODEL_V2.md`
- `docs/WORKER_PROTOCOL_V2.md`
- `docs/FILE_SPLITTING_STANDARD.md`

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
