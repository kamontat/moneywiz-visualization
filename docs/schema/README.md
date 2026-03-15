# Data Schema Documentation

This directory contains split, comprehensive reference documentation for MoneyWiz SQLite database schema, data parser rules, and SQL queries.

---

## Table of Contents

### 1. [intro.md](./intro.md) — Schema Foundation

- **ER Diagram**: Mermaid diagram of all tables and relationships
- **Entity ID Map**: `Z_PRIMARYKEY` mappings and entity hierarchy
- **Notes**: Core Data style database conventions, relationship inference rules

### 2. [import-rules.md](./import-rules.md) — Data Parsing Rules

- **SQLite Import Rules**: Transaction import semantics and error handling
- **Field Conversions**: Type mappings, amount/currency normalization, date handling
- **Transaction Classification**: Rule-based classifier for transaction types and categories

### 3. [filtering.md](./filtering.md) — Runtime Query Semantics

- **Filter Chain**: Account, category, and date filtering pipeline
- **Category Handling**: Single-category vs. multi-category transaction rules, tree structure logic
- **Transaction Tree Structure**: Parent-child relationships and filter application

### 4. [sql-queries.md](./sql-queries.md) — Query Patterns

- **SQL Queries**: Common queries (accounts, transactions, categories, tags, budgets)
- **Shared Rules**: GROUP BY semantics, aggregate functions, timezone handling
- **Performance Notes**: Index usage and query optimization guidelines

---

## Purpose

These sections are extracted and reorganized from the original consolidated schema (1007 lines) to enable:

1. **Modular updates**: Each section can be maintained and versioned independently
2. **Clear navigation**: Developers can jump directly to relevant documentation
3. **Reduced cognitive load**: Smaller, focused reference material
4. **Future generation**: Script-based extraction from source code (e.g., SQL comments)

---

## Cross-References

- See [AGENTS.md](../../AGENTS.md) for project architecture and hard rules
- See [ARCHITECTURE.md](../ARCHITECTURE.md) for module boundaries and dependency direction

---

## Status

✅ **Content migrated.** All sections split from original schema into 4 modular files.
