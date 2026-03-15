# src/lib — Domain Modules

## CORE MODULES

```text
src/lib/
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
```

## WORKFLOW CONTRACT

1. Upload:

- `app/controllers/sessionController.ts` -> worker `upload`
- worker imports source (OPFS preferred)
- worker extracts/classifies/writes snapshot + manifest

2. Reopen:

- `app/controllers/sessionController.ts` -> worker `bootstrap`
- load from IndexedDB snapshot first

3. Recovery:

- if snapshot invalid and source backend is OPFS, run `rebuild_snapshot`

4. Clear:

- `app/controllers/sessionController.ts` -> worker `clear`
- clear snapshot + manifest + OPFS source (if exists)

## DEPENDENCY RULES

- `app/` orchestrates workflows via `apis/`, `session/`, `source/sqlite/`, and `transactions/`.
- `source/sqlite/` owns its own `models`, `worker/runtime`, and `worker/utils`.
- `src/lib/*` may use `src/utils/*`.
- `src/lib/*` must keep UI concerns out of worker/parser logic.

## SPLIT-FIRST PATTERN

- For multi-operation concerns, use folder split:

```text
feature/
  apis/
    index.ts
    upload.ts
    clear.ts
```

- `index.ts` re-exports only.
- Implementation files should be single-responsibility.
- Keep source files under 300 LOC (target ~220).

## REQUIRED DOCS

Before changing SQLite logic, read:

- `../../docs/ARCHITECTURE.md`
- `../../docs/schema/README.md`
