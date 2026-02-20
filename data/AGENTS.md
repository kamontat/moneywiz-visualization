# data/ — Local Development Data

## OVERVIEW

This directory contains local test data for development and manual testing.
It is **excluded from version control** (via `.gitignore`), with specific
exceptions for example files.

## CONTENTS

- **SQLite Databases**: MoneyWiz database files (`*.sqlite`) for testing
  parsing and visualization.

## CONSTRAINTS

1. **Local Only**: Files here (except committed examples) are **not available**
   in CI/CD environments.
2. **No Runtime Dependency**: Application code must **not** rely on files in
   this directory for production functionality.
3. **Test Fixtures**: Automated tests should generate their own fixtures
   rather than reading from here.

## REFERENCES

- **SQLite Import/Behavior**: See [RULES.md](../RULES.md)
- **Database Schema**: See [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)
