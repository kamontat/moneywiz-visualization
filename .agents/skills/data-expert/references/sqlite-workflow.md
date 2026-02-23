# SQLite Workflow Reference

Use this checklist for any database-data task.

## Required sources

1. `RULES.md`
2. `DATABASE_SCHEMA.md`
3. `data/ipadMoneyWiz.sqlite`

## Workflow checklist

1. List tables from the real SQLite file.
2. Inspect schema for every table touched by the change.
3. Run SELECT queries to guide implementation:
- expected joins
- entity-based classification rules
- import-time filters
4. Define expected behavior for:
- browser parser output
- loading and transformation path
- persistence/store updates
5. Confirm edge cases from project rules:
- `ReconcileTransaction` (`Z_ENT = 42`) maps to `Reconcile`
- uncategorized `new balance` rows are filtered out at import
6. Implement changes.
7. Re-run the same SQL checks after implementation.
8. Add or update tests using generated fixtures only.

## Evidence format

Provide:

1. SQL statements executed
2. Example rows and counts used for parser/loading decisions
3. Exact files changed for logic/tests
4. Any unresolved assumptions
