# src/lib/source/sqlite — SQLite Worker Engine

## OVERVIEW

Worker-based SQLite parsing engine. Runs extraction/classification in dedicated
worker thread. Main thread communicates via typed message protocol.

## STRUCTURE

```text
source/sqlite/
  client/           # Worker client factory, request helpers
  models/           # Protocol types, request/response shapes
  worker/
    entry.ts        # Worker entry point (DedicatedWorkerGlobalScope)
    runtime/        # executeWorkerRequest, dispatch, lifecycle, sqlite-engine
    handlers/       # Action handlers: upload, bootstrap, clear, status, rebuild-snapshot
    backends/       # Storage backends: opfs-backend, snapshot-backend, factory
    extractors/     # Data extractors: transactions, relations, lookups
    writers/        # Persistence: snapshot-writer, manifest-writer
    utils/          # Worker utilities: batch, chunk-reader, sql-row, yield
```

## MESSAGE PROTOCOL

```typescript
// Client → Worker
SQLiteWorkerRequest { action, payload, requestId }

// Worker → Client
SQLiteWorkerResponse { action, result, error?, requestId }
SQLiteWorkerProgress { action, progress, requestId }
```

## HANDLER CONTRACT

Each handler in `handlers/` implements:

```typescript
export async function handleAction(
	request: SQLiteWorkerRequest,
	ctx: WorkerContext
): Promise<SQLiteWorkerResponse>
```

Handlers use `postWorkerProgress()` for incremental updates.

## BACKEND SELECTION

| Backend    | Source      | Rebuild | Use Case                   |
| ---------- | ----------- | ------- | -------------------------- |
| `opfs`     | OPFS file   | ✓       | Default, persistent source |
| `snapshot` | Memory only | ✗       | Fallback, no OPFS support  |

Factory in `backends/backend-factory.ts` selects based on browser capability.

## WORKFLOW

1. **Upload**: client → `upload` handler → backend.import → extractors → writers
2. **Bootstrap**: client → `bootstrap` handler → validate snapshot → load or rebuild
3. **Clear**: client → `clear` handler → delete snapshot + manifest + OPFS source

## CONVENTIONS

- All SQLite queries run via `sqlite-engine.ts` helpers
- Extractors yield batches; writers consume batches
- Use `yieldToMain()` between heavy operations
- Keep handlers ≤300 LOC; split into extractor/writer if growing

## ANTI-PATTERNS

- Never import worker internals from main thread (use client only)
- Never run SQLite queries outside worker context
- Never block worker with synchronous loops (use batch + yield)

## REFERENCE DOCS

- `../../../docs/schema/README.md` — SQLite schema, field mappings
- `../../../docs/ARCHITECTURE.md` — storage model, workflow diagrams
