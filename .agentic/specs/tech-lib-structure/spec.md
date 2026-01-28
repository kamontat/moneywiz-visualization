# Spec: tech-lib-structure

## Purpose

Define the module structure for `src/lib` to prevent future monolithic growth and ensure separation of concerns.

## Requirements

The `src/lib` directory contains the core business logic and utilities for the application. It must be organized into focused modules rather than monolithic files.

### Directory Structure

- **`src/lib/analytics/`**: Domain logic for financial analysis.
  - `totals.ts`: Calculation of income, expense, net, and saving rates.
  - `categories.ts`: Category breakdown and top category analysis.
  - `timeseries.ts`: Daily and monthly trend calculations.
  - `filters.ts`: Filtering logic (dates, tags).
  - `tags.ts`: Tag parsing and extraction.
  - `index.ts`: Barrel file exporting all public API.

- **`src/lib/csv/`**: CSV file handling.
  - `parser.ts`: Raw CSV text parsing and tokenization.
  - `transformer.ts`: Converting raw rows into domain objects (`MoneyWizTransaction`).
  - `types.ts`: CSV-specific type definitions.
  - `index.ts`: Barrel file exporting all public API.

- **`src/lib/stores/`**: Svelte stores for state management.
  - Each store should have its own file (e.g., `csv.ts`).

- **`src/lib/finance.ts`**: Low-level financial utilities (currency formatting, basic date parsing).
- **`src/lib/debug.ts`**: centralized debug logging utility.
- **`src/lib/types.ts`**: Shared domain type definitions.

## Constraints

- New logic should be placed in appropriate submodules, not in root-level files.
- Circular dependencies between submodules should be avoided.
- Use `index.ts` files to define public module boundaries.

## Examples

```typescript
// Importing from analytics module
import { calculateTotals } from '$lib/analytics';

// Importing from csv module
import { parseMoneyWizReport } from '$lib/csv';
```

## Notes

This structure was adopted to replace the previous monolithic `analytics.ts` and `csv.ts` files.
