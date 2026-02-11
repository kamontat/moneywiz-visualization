# e2e — Playwright Tests

## Scope

- End-to-end tests for UI behavior in `e2e/*.spec.ts`.
- Shared fixture generators and helpers live in `e2e/utils/`.

## Required Data Policy

- Do not load fixtures from `static/data` or `static/database`.
- Those folders are local-only, gitignored, and unavailable in GitHub
  Actions.
- Generate test input in code, for example with
  `e2e/utils/csv-generator.ts`.

## Reference Docs (Required)

- For CSV condition changes in tests, check [RULES.md](../RULES.md) first.
- For SQLite/database condition changes in tests or fixtures, check
  [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) first.

## Patterns

- Prefer `setInputFiles({ name, mimeType, buffer })` over file-path uploads.
- Keep tests isolated; each spec should set up its own minimal fixture data.
