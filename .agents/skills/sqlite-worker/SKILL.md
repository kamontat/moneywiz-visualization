---
name: sqlite-worker
description: Work with the SQLite worker pipeline, protocol, and ingestion internals. Use when modifying worker handlers, backends, extractors, writers, or the worker message protocol.
---

# SQLite Worker Pipeline

Use this skill when modifying anything under `src/lib/source/sqlite/worker/`.

## 1) Read required reference docs first

1. Read `references/ingestion-pipeline.md` for the full pipeline sequence.
2. Read `references/worker-protocol.md` for request/response schemas.
3. Read `docs/schema/README.md` for entity mapping and classification rules.

## 2) Understand the pipeline

- Upload: file → OPFS → extract lookups → extract relations → stream transactions → classify → write snapshot → manifest.
- Bootstrap: check snapshot → load or rebuild.
- Clear: delete snapshot + manifest + OPFS source.

## 3) Key constraints

- All SQLite parsing and extraction must run in the worker thread only.
- Never import `@sqlite.org/sqlite-wasm` outside of worker files.
- Worker handlers are single-responsibility; keep them under 300 LOC.
- Progress reporting uses phase-based messages emitted during long operations.

## 4) After changes

1. Run `bun run test:unit` for worker and source-related tests.
2. Run `bun run build` to confirm no import errors.
3. Run `bun run check` for full quality gates.
