# src/utils — Platform Utilities

## PURPOSE

`src/utils` provides reusable primitives only:

- db abstraction
- state/store helpers
- API helper wrappers
- shared TS utility types

## BOUNDARY RULE

- `src/utils` can be imported by `src/lib` and `src/utils` only.
- `src/components` and `src/routes` must never import `src/utils` directly.
- `src/utils` must not import `src/lib`.

## SPLIT-FIRST RULE

- Keep non-test files <= 300 LOC.
- For multi-operation concerns, use folder split with `index.ts` aggregator.
- Do not grow monolithic `*.ts` utility files.

## STRUCTURE

```text
utils/
  db/
  apis/
  states/
  stores/
  types/
```

## REFERENCE DOCS

For SQLite/database behavior impacts, check:

- `../../docs/ARCHITECTURE.md`
- `../../docs/schema/README.md`
