# Proposal: improve-test-structure

## Objective

Restructure tests by moving route-level tests to the E2E suite and enforcing isolated test data generation.

## Description

Currently, `src/routes/` contains `.spec.ts` files that function more like integration or E2E tests but are co-located with the source. These tests often rely on static CSV files (`static/data/report.csv`), creating brittle dependencies. This plan moves all `src/routes/*.spec.ts` files to the `e2e/` directory, treating them as full E2E tests using Playwright. It also mandates that every test must generate or mock its own unique CSV data, eliminating the reliance on shared `static/data/` files for testing purposes.

## Acceptance Criteria

- [ ] All `src/routes/*.spec.ts` files are moved to `e2e/` and refactored as Playwright tests.
- [ ] No `src/routes/*.spec.ts` files remain in the source tree.
- [ ] All tests in `e2e/` (new and existing) generate their own specific CSV data for execution.
- [ ] References to `static/data/report.csv` and `static/data/wrong-report.csv` are removed from all test files.
- [ ] Tests pass successfully with the new structure and data isolation.

## Out of Scope

- Refactoring unit tests for `src/components/` (these remain co-located).
- Changing the actual implementation of the application logic (unless required for testability).
- Deleting the `static/data/*.csv` files themselves (they may be used for manual demo purposes, just not in automated tests).

## References

- [Playwright Documentation](https://playwright.dev/)
