# Spec: tech-data-models

## Purpose

Define the TypeScript interfaces and data structures used to represent financial data within the application.

## Requirements

### Core Transaction Model

The `MoneyWizTransaction` interface is the central data structure.

### Enums & Types

- **AccountType**: Strict union of allowed MoneyWiz account codes.
  - Values: `'A'`, `'C'`, `'D'`, `'L'`, `'I'`, `'CT'`

### Sub-Structures

- **ParsedAccount**:
  - `name`: string
  - `extra`: string
  - `type`: AccountType | 'Unknown'

- **ParsedCategory**:
  - `root`: string
  - `sub`: string

- **ParsedTag**:
  - `group`: string
  - `name`: string

## Constraints

- All monetary values (`amount`) must be stored as JavaScript `number` (float).
- Dates must be stored as JavaScript `Date` objects.
- All strings must be trimmed of leading/trailing whitespace.

## Examples

### MoneyWizTransaction Interface

```typescript
interface MoneyWizTransaction {
	account: ParsedAccount;
	transfers: ParsedAccount | null;
	description: string;
	payee: string;
	category: ParsedCategory | null;
	date: Date;
	memo: string;
	amount: number;
	currency: string;
	checkNumber: string;
	tags: ParsedTag[];
}
```

## Notes

- This model is designed for in-memory manipulation and visualization.
- Persistence layers (if added) should map to this structure.
