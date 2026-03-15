---
name: data-expert
description: Work with SQLite-backed data features using real data from `data/ipadMoneyWiz.sqlite` instead of assumptions. Use when adding or changing browser data parsers, import/loading flows, SQL queries, mapping logic, classification rules, aggregations, or any database-driven behavior.
---

# SQLite Data Workflow

Use this workflow for any SQLite-related data task.

## 1) Read required project docs first

1. Read `docs/schema/README.md`.
2. Record relevant entities, join keys, and classification constraints before editing code.

## 2) Inspect real database content

Always inspect `data/ipadMoneyWiz.sqlite` before implementing or
reviewing logic.

```bash
bash .agents/skills/data-expert/scripts/inspect_sqlite.sh \
  --db data/ipadMoneyWiz.sqlite --tables
```

Use the helper script for schema and data checks:

```bash
bash .agents/skills/data-expert/scripts/inspect_sqlite.sh \
  --db data/ipadMoneyWiz.sqlite --schema ZSYNCOBJECT

bash .agents/skills/data-expert/scripts/inspect_sqlite.sh \
  --db data/ipadMoneyWiz.sqlite \
  --query "SELECT Z_ENT, COUNT(*) FROM ZSYNCOBJECT GROUP BY Z_ENT LIMIT 20"

bash .agents/skills/data-expert/scripts/inspect_sqlite.sh \
  --db data/ipadMoneyWiz.sqlite \
  --query "SELECT Z_ENT, ZAMOUNT, ZDESC FROM ZSYNCOBJECT \
           WHERE Z_ENT IN (36, 42) LIMIT 20"
```

## 3) Design or update data logic

Use findings from real SQL data to drive implementation.

1. Define target behavior:
- parser output shape in browser
- loading pipeline stages (fetch -> parse -> map -> store -> render)
- error handling and fallback behavior
2. Map each behavior to verified schema fields and entity ids.
3. Identify edge cases from real rows before coding.

## 4) Verify assumptions before and after code changes

1. Confirm table and column names exist in the SQLite file.
2. Confirm key filters or classifications on real rows.
3. Confirm edge cases from project rules, including:
- entity `42` mapping to `Reconcile`
- uncategorized `new balance` rows filtered at import time

If any assumption fails, adjust logic before shipping.

## 5) Implement and re-check

After code changes, rerun the same SQL checks used for design.

1. Reconfirm expected row selection and counts.
2. Reconfirm classification-relevant rows still match the intended behavior.
3. Update or add tests using generated fixtures, not `static/data` or `static/database`.

## 6) Report with evidence

Include:

1. SQL commands executed
2. Key rows or counts that justify parser/loading decisions
3. Rules/schema constraints referenced
4. Remaining risks if any assumption could not be fully validated

## References

- Workflow checklist: `references/sqlite-workflow.md`
- Data schema & parser rules: `docs/schema/README.md`
