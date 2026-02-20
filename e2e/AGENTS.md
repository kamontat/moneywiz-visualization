# e2e — Playwright Tests

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
  [RULES.md](../RULES.md) and [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) first.

## Patterns

- Prefer `setInputFiles({ name, mimeType, buffer })` over file-path uploads.
- Keep tests isolated; each spec should set up its own minimal fixture data.
