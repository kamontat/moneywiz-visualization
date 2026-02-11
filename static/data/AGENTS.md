# static/data — Local-Only Workspace

## Important

- This directory is intentionally gitignored.
- Files here are not available in CI or GitHub Actions.
- Do not reference this directory from app runtime code, tests, or docs as
  required input.

## Usage

- Local manual experimentation only.
- If tests need CSV input, generate fixtures in code instead of reading files
  from this directory.
- For CSV condition changes, consult [RULES.md](../../RULES.md).
- For SQLite/database condition changes, consult
  [DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md).
