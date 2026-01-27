---
name: web-unit-tester
description: Expert-level guide for unit testing in the MoneyWiz Visualization project using Vitest. Covers logic validation, component testing, and debugging. Use when business logic, data parsing, or component internals change.
---

# MoneyWiz Web Unit Testing

This skill provides comprehensive instructions for writing, updating, and debugging unit tests using **Vitest**.

## When to Use This Skill

- **Logic Changes**: When modifying business logic in `src/lib/` (e.g., CSV parsing, financial calculations).
- **Code Refactoring**: When restructuring core utilities or helper functions.
- **Bug Fixes**: When a regression or logic error is found and requires a reproducing test case.
- **Component Validation**: When testing Svelte component logic (not E2E behavior).
- **Manual Trigger**: When specifically asked to "write unit tests" or "fix unit tests".

## Core Principles

- **Framework**: Vitest (ESM based).
- **Location**: Co-locate tests with source files (e.g., `src/lib/csv.ts` -> `src/lib/csv.spec.ts`).
- **Standard**: Follow ES2022+ features and ESM modules.
- **Simplicity**: Prefer plain functions over complex class structures for testable logic.
- **Purity**: Never change the original code solely to make it easier to test; instead, use Vitest's mocking capabilities.

## Execution

| Action | Command |
| :--- | :--- |
| **All unit tests** | `bun run test` (often includes Vitest) |
| **Vitest (Server)** | `bun vitest run --project=server` (logic in `src/lib`) |
| **Vitest (Client)** | `bun vitest run --project=client` (Svelte components) |
| **Watch Mode** | `bun vitest` |

## Writing Quality Unit Tests

### 1. Test Organization
- Use `describe` blocks to group related functions or scenarios.
- Use `it` or `test` for individual assertions.
- Maintain descriptive names: `describe('parseCsv', () => { it('should handle CRLF line endings', () => { ... }) })`.

### 2. Mocking & Environment
- Use `vi.mock()` to isolate the module under test from its dependencies (e.g., mocking `debug` or stores).
- For Svelte components, use `page.render()`.

### 3. Assertions
- Use Vitest's `expect` API.
- Prefer specific matchers: `toEqual()`, `toBeDefined()`, `toThrow()`.

## MoneyWiz Specific Unit Testing

### CSV Parsing (`src/lib/csv.ts`)
- Test variations in CSV exports: different delimiters, BOM presence, quoted fields, and the `sep=` preamble.
- Validate that types are correctly inferred (dates as strings, amounts as numbers).

### Financial Logic (`src/lib/finance.ts`)
- Test mathematical edge cases: zero balances, all-income vs all-expense months.
- Verify category aggregation and savings rate calculations.

### Stores (`src/lib/stores/`)
- Test store updates and reactivity in isolation.

## Quality Checklist
- [ ] Tests cover happy paths and edge cases (empty strings, undefined values).
- [ ] No `null` usage; use `undefined`.
- [ ] No unnecessary comments; code should be self-explanatory.
- [ ] Async code uses `await/async`.
- [ ] Mocking is used to prevent external side effects.
