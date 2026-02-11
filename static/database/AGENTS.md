# static/database — Local-Only Workspace

## Important

- This directory is intentionally gitignored.
- Files here are not available in CI or GitHub Actions.
- Do not reference this directory from app runtime code, tests, or docs as
  required input.

## Usage

- Local/private database inspection only.
- Keep schema documentation generic and source-path agnostic for committed
  docs.
- For CSV condition changes, consult [RULES.md](../../RULES.md).
- For SQLite/database condition changes, consult
  [DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md).
