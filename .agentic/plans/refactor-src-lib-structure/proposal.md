# Proposal: refactor-src-lib-structure

## Objective

Refactor `src/lib` by splitting large monolithic files into smaller, focused modules to improve maintainability and separation of concerns.

## Description

The current `src/lib` directory contains several "god files" like `analytics.ts` and `csv.ts` that handle multiple distinct responsibilities (parsing, searching, calculation, filtering). This plan will modularize these files into dedicated directories with granular files (e.g., `src/lib/analytics/filters.ts`, `src/lib/csv/parser.ts`). This structure will make the codebase easier to navigate, test, and extend.

## Acceptance Criteria

- [ ] `src/lib/analytics.ts` is replaced by a `src/lib/analytics/` directory with sub-modules.
- [ ] `src/lib/csv.ts` is replaced by a `src/lib/csv/` directory with sub-modules.
- [ ] `src/lib/finance.ts` and `src/lib/debug.ts` are evaluated for relocation or modularization.
- [ ] All existing unit tests pass without modification to the test logic (only import updates).
- [ ] The application builds and runs successfully.

## Out of Scope

- Adding new features or analytical capabilities.
- Changing the behavior of existing functions.
- rewriting the entire app structure (only `src/lib` is targeted).

## References

- [SvelteKit Library Structure](https://kit.svelte.dev/docs/modules#$lib)
