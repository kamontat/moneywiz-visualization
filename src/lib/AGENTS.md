# src/lib — Domain Modules (V2)

## CORE MODULES

```text
src/lib/
  session/          # bootstrap/upload/clear/status orchestration
  source/sqlite/    # worker client + worker runtime + backends/extractors/writers
  ledger/           # importer/classifier/repository/models
```

## WORKFLOW CONTRACT

1. Upload:

- `session/apis/upload.ts` -> worker `upload`
- worker imports source (OPFS preferred)
- worker extracts/classifies/writes snapshot + manifest

2. Reopen:

- `session/apis/bootstrap.ts` -> worker `bootstrap`
- load from IndexedDB snapshot first

3. Recovery:

- if snapshot invalid and source backend is OPFS, run `rebuild_snapshot`

4. Clear:

- `session/apis/clear.ts` -> worker `clear`
- clear snapshot + manifest + OPFS source (if exists)

## DEPENDENCY RULES

- `session` may depend on `source/sqlite` and `ledger`.
- `source/sqlite` owns its own `models`, `worker/runtime`, and `worker/utils`.
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

- `../../docs/DATA_PARSER.md`
- `../../docs/SQLITE_SCHEMA.md`
- `../../docs/INGESTION_WORKER_PIPELINE.md`
- `../../docs/WORKER_PROTOCOL_V2.md`
