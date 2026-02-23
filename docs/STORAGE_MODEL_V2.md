# Storage Model V2

## Stores

Primary IndexedDB database: `moneywiz-ledger-v2`

Object stores:

- `session_manifest_v2` (`key: 'current'`)
- `ledger_transactions_v2` (parsed transaction snapshot)
- `ledger_meta_v2` (snapshot metadata)

## Source of Truth

- SQLite file in OPFS (preferred backend) is the durable source for rebuild.
- IndexedDB snapshot is the query/read model for UI.

## Backend Contract

- `opfs` backend:
- upload imports source into OPFS and builds snapshot
- refresh reads snapshot; rebuild allowed if snapshot invalid
- clear removes both snapshot and OPFS source

- `snapshot` backend fallback:
- upload parses from uploaded file in worker memory
- refresh reads snapshot only
- rebuild is not available without OPFS source

## Refresh Behavior

On reopen:

1. app checks snapshot validity
2. if valid -> load from snapshot only
3. if invalid + OPFS source available -> rebuild snapshot
4. else -> idle and request re-upload
