# Migration Notes V2

## What Changed

- Database ingestion architecture moved to:
- `src/lib/session`
- `src/lib/source/sqlite`
- `src/lib/ledger`
- Worker-only SQLite parsing and extraction.
- Snapshot-first bootstrap on page reopen.

## One-Time Migration Impact

- Existing cached state from earlier versions is not guaranteed compatible.
- Users may need one-time re-upload after V2 deploy.

## Removed/Deprecated

- Removed experimental SQLite route: `src/routes/sqlite/+page.svelte`.
- Legacy flat ingestion internals are replaced by split worker handlers,
  backends, extractors, and writers.

## Operational Expectations

- Upload builds IndexedDB snapshot and writes manifest.
- Refresh loads from snapshot.
- Clear removes snapshot and source (OPFS when available).
