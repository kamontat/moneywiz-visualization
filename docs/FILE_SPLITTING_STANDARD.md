# File Splitting Standard

## Hard Rule

- All non-test source files in `src/lib` and `src/utils` must be `<= 300` LOC.
- Proactive split target is `~220` LOC.

## Required Pattern

For multi-operation concerns, use folder split with aggregator:

```text
feature/
  apis/
    index.ts
    upload.ts
    clear.ts
    bootstrap.ts
```

Rules:

1. `index.ts` is the only re-export barrel.
2. Implementation files are single-responsibility and not barrels.
3. Prefer one primary exported unit per file.

## Naming Guidance

- Avoid monolith names like `apis.ts`, `state.ts`, `store.ts` when there are
  multiple operations.
- Prefer `apis/index.ts` with per-operation files.

## Exceptions

- Generated files or protocol type maps may exceed 300 LOC only when splitting
  harms correctness.
- Exception must include top-of-file comment header:

```ts
// LOC_EXEMPT: generated
```

or

```ts
// LOC_EXEMPT: protocol
```

## Enforcement

- Run `bun run check:loc`.
- CI should fail on files above 300 LOC without exemption.
