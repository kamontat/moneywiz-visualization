# data/ — Local Development Data

## OVERVIEW

This directory contains local test data for development and manual testing.
It is **excluded from version control** (via `.gitignore`), with specific
exceptions for example files.

## CONTENTS

- **CSV Files**: Exports from MoneyWiz for testing parsing and visualization.
- **SQLite Databases**: MoneyWiz database files (`*.sqlite`) for direct DB
  inspection.
- **Examples**: `example.csv` and `invalid-example.csv` are committed to serve
  as references.

## CONSTRAINTS

1. **Local Only**: Files here (except committed examples) are **not available**
   in CI/CD environments.
2. **No Runtime Dependency**: Application code must **not** rely on files in
   this directory for production functionality.
3. **Test Fixtures**: Automated tests should generate their own fixtures (see
   `e2e/utils/csv-generator.ts`) rather than reading from here.

## REFERENCES

- **CSV Parsing/Behavior**: See [RULES.md](../RULES.md)
- **Database Schema**: See [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)
