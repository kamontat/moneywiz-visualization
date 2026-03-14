# Ingestion Worker Pipeline

## Commands

Worker request actions:

- `upload`
- `bootstrap`
- `rebuild_snapshot`
- `clear`
- `status`

## Upload Sequence

1. `upload` request includes browser `File`.
2. Backend selection:

- OPFS supported: import file into OPFS and open `OpfsDb`.
- Otherwise: use in-memory snapshot backend.

3. Extract lookups (`Z_PRIMARYKEY`, accounts, payees, categories, tags).
4. Extract relations (`ZCATEGORYASSIGMENT`, `Z_36TAGS`).
5. Stream transaction rows from `ZSYNCOBJECT` transaction entities.
6. Apply import filter rules (`new balance` noise, incomplete income/expense).
7. Classify each transaction by rule priority.
8. Persist parsed batch to IndexedDB snapshot store.
9. Write session manifest and snapshot-ready metadata.
10. Emit final `complete` progress.

## Bootstrap Sequence

1. Check snapshot validity from manifest/meta.
2. If valid: return ready from snapshot.
3. If invalid and backend is OPFS and source exists: run rebuild.
4. If source unavailable: return not ready with reason.

## Clear Sequence

1. Delete snapshot transaction store.
2. Delete snapshot metadata and manifest.
3. Delete OPFS source when backend is OPFS.

## Progress Phases

- `source_import`
- `lookups`
- `relations`
- `transactions`
- `snapshot_write`
- `complete`
- `error`
