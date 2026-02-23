# Directory Link Diagram V2

## Purpose

This document shows how the new V2 directories depend on each other and
how data moves through upload, bootstrap, rebuild, and clear workflows.

## High-Level Dependency Links

```mermaid
graph TD
	UI["src/routes + src/components"]
	LIB["src/lib/*"]
	SESSION["src/lib/session"]
	SOURCE["src/lib/source/sqlite"]
	LEDGER["src/lib/ledger"]
	TRANS_SHARED["src/lib/transactions (shared models/utils)"]
	UTILS["src/utils/*"]

	UI --> LIB
	LIB --> SESSION
	LIB --> SOURCE
	LIB --> LEDGER
	SESSION --> SOURCE
	SOURCE --> LEDGER
	LEDGER --> TRANS_SHARED
	LIB --> UTILS

	UI -. "forbidden" .-> UTILS
	UTILS -. "forbidden" .-> LIB
```

## source/sqlite Internal Links

```mermaid
graph LR
	CLIENT["source/sqlite/client/*"] --> ENTRY["source/sqlite/worker/entry.ts"]
	ENTRY --> RUNTIME["source/sqlite/worker/runtime/*"]
	RUNTIME --> HANDLERS["source/sqlite/worker/handlers/*"]

	HANDLERS --> BACKENDS["source/sqlite/worker/backends/*"]
	HANDLERS --> EXTRACTORS["source/sqlite/worker/extractors/*"]
	HANDLERS --> WRITERS["source/sqlite/worker/writers/*"]

	BACKENDS --> SQLITE_ENGINE["worker/runtime/sqlite-engine.ts"]
	EXTRACTORS --> SQLITE_ENGINE
	EXTRACTORS --> WUTILS["source/sqlite/worker/utils/*"]

	WRITERS --> IMPORTER["ledger/importer/*"]
	WRITERS --> REPO["ledger/repository/*"]
	WRITERS --> SESSION_IO["session/persistence/*"]
```

## Storage + Runtime Workflow

```mermaid
sequenceDiagram
	participant UI as "Routes/Components"
	participant Session as "session/apis"
	participant Worker as "source/sqlite worker"
	participant OPFS as "OPFS source"
	participant IDB as "IndexedDB snapshot + manifest"

	UI->>Session: upload(file)
	Session->>Worker: action = upload
	Worker->>OPFS: write source (if supported)
	Worker->>IDB: extract + classify + write snapshot
	Worker-->>Session: transactionCount + source metadata
	Session-->>UI: ready

	UI->>Session: bootstrap()
	Session->>Worker: action = bootstrap
	Worker->>IDB: validate snapshot
	alt snapshot valid
		Worker-->>Session: ready from snapshot
	else snapshot invalid and OPFS source exists
		Worker->>Worker: action = rebuild_snapshot
		Worker->>IDB: rebuild snapshot from OPFS source
		Worker-->>Session: ready (rebuilt)
	else no source available
		Worker-->>Session: not ready
	end

	UI->>Session: clear()
	Session->>Worker: action = clear
	Worker->>IDB: delete snapshot + manifest
	Worker->>OPFS: delete source
	Worker-->>Session: cleared
```

## Notes

- SQLite parsing and extraction run only in worker thread.
- Reopen path reads from IndexedDB snapshot first, not raw SQLite query.
- Clear always removes both snapshot (IndexedDB) and source (OPFS).
- System assumes one active source database at a time.
