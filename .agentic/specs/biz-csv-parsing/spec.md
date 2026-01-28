# Spec: biz-csv-parsing

## Purpose

Define the parsing rules for the MoneyWiz CSV export format to ensure consistent data interpretation across the application.

## Requirements

### General

- The system must parse CSV files exported from MoneyWiz.
- CSV files may contain a metadata preamble (e.g., `sep=,`).
- Leading empty lines must be ignored.

### Categories

- Categories are hierarchical strings separated by `>`.
- **Parser Rule**: Split by `>` and trim whitespace.
  - Part 1: Root Category
  - Part 2: Subcategory (optional)

### Tags

- Tags are semi-colon separated lists in a single string.
- Individual tags can optionally belong to a group, separated by `:`.
- **Parser Rule**:
  1. Split by `;` to get individual tag strings.
  2. For each tag string, split by `:` to separate Group from Name.
  3. If no group is present, the entire string is the Name.

### Accounts

- Account fields contain the account name and its type in parentheses.
- **Format**: `Account Name (Type)` or `Account Name Extra Info (Type)`
- **Supported Types**:
  - `A`: Asset? (Verify mapping if needed)
  - `C`: Cash?
  - `D`: Debit?
  - `L`: Liability/Loan
  - `I`: Investment
  - `CT`: Credit Card?
- **Parser Rule**: match against regex `^(.*)\s\((.*)\)$`.

### Dates

- CSV contains separate `Date` and `Time` columns.
- **Parser Rule**: Combine `Date` (DD/MM/YYYY) and `Time` (HH:MM) into a single ISO-8601 compatible Date object.

## Constraints

- Input is strictly Read-Only (we do not write back to CSV).
- Currency formatting in the CSV (e.g., "1,234.56") must be sanitized before numerical parsing.

## Examples

### Category Parsing

```typescript
"Bills > Utilities" -> { root: "Bills", sub: "Utilities" }
"Groceries" -> { root: "Groceries", sub: "" }
```

### Tag Parsing

```typescript
"Vacation; Project:Renovation" -> [
  { group: "", name: "Vacation" },
  { group: "Project", name: "Renovation" }
]
```

### Account Parsing

```typescript
"Chase Checking (A)" -> { name: "Chase Checking", extra: "", type: "A" }
```

## Notes

- The preamble `sep=,` is common in Excel-generated CSVs and must be handled to avoid header parsing errors.
