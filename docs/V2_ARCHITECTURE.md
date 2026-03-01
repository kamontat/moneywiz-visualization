# Architecture V2

## Goal

V2 separates ingestion/session orchestration from domain data usage.
SQLite parsing always runs in a worker. IndexedDB snapshot is the runtime
read model.

## Module Boundaries

```text
src/lib/
  session/         # UI-facing lifecycle: bootstrap, upload, clear, status
  source/sqlite/   # Worker client/protocol/runtime/backends/extractors/writers
  ledger/          # Snapshot models, classifier, importer, read/write repos
  ...other domains

src/utils/
  db/
  apis/
  states/
  stores/
  types/
```

## Responsibility Map

- `session`: orchestrates workflow state and exposes app APIs.
- `source/sqlite`: source ingestion engine and worker protocol.
- `ledger`: transaction classification, filtering, and snapshot persistence.
- `utils`: generic platform primitives, imported only by `src/lib` and `src/utils`.

## Dependency Direction

Allowed direction:

1. `src/components|src/routes` -> `src/lib`
2. `src/lib/session` -> `src/lib/source/sqlite` and `src/lib/ledger`
3. `src/lib/source/sqlite` -> `src/lib/ledger` and its own worker internals
4. `src/lib/*` -> `src/utils/*`

Disallowed:

- `src/components|src/routes` -> `src/utils/*`
- `src/utils/*` -> `src/lib/*`

## Runtime Workflow

1. User uploads SQLite file.
2. `session/apis/upload.ts` sends worker request (`upload`).
3. Worker imports source (OPFS preferred), parses/extracts/classifies in batches.
4. Worker writes snapshot to IndexedDB (`ledger_transactions_v2`) and manifest.
5. Reopen uses `bootstrap` to load snapshot status and avoid direct SQLite query.
6. Invalid snapshot + OPFS source triggers worker rebuild.
7. Clear removes snapshot + manifest + OPFS source.

## Diagram Reference

See `docs/DIRECTORY_LINK_DIAGRAM_V2.md` for dependency and workflow
diagrams.
