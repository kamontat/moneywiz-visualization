# e2e — Playwright Tests

**Updated:** 2026-03-15

## Commands

```bash
bun run test:e2e          # Run all e2e tests
bunx playwright test      # Direct Playwright run
bunx playwright show-report  # View last test report
```

## Scope

- End-to-end tests for UI behavior in `e2e/*.spec.ts`.
- Shared fixture generators and helpers live in `e2e/utils/`.

## Required Data Policy

- Do not load fixtures from `static/data` or `static/database`.
- Those folders are local-only, gitignored, and unavailable in GitHub
  Actions.
- Generate test input in code.

## Reference Docs (Required)

- For SQLite/database condition changes in tests or fixtures, check
  [docs/schema/README.md](../docs/schema/README.md) first.

## Patterns

- Prefer `setInputFiles({ name, mimeType, buffer })` over file-path uploads.
- Keep tests isolated; each spec should set up its own minimal fixture data.
