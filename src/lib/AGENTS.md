# src/lib — Domain Modules

## OVERVIEW

Domain-specific business logic organized by feature. Each domain keeps
its own public API via `index.ts`, with types in `models/`.

## STRUCTURE

```
lib/
├── analytics/          # Data transforms and filters for visualization
│   ├── filters/        # Filter transactions + filter option state/store
│   └── transforms/     # Aggregate data (category totals, tree, time series, summarize)
├── charts/             # Chart.js adapters + chart options + theme palette mapping
├── csv/                # CSV metadata state/store APIs
├── transactions/       # Transaction models, CSV parsing, classification, import
├── themes/             # Theme state, store, DaisyUI theme switching helpers
├── formatters/         # Amount, date, category display formatters
├── loggers/            # Debug logging with namespaced loggers
└── components/         # Component utilities (NOT Svelte components)
```

## WHERE TO LOOK

| Task                 | Location                                                              |
| -------------------- | --------------------------------------------------------------------- |
| Parse CSV rows       | `transactions/csv.ts` + `transactions/import.ts`                      |
| Classify transaction | `transactions/classifier.ts`                                          |
| Add filter           | `analytics/filters/` + export from `analytics/filters/index.ts`       |
| Add transform        | `analytics/transforms/` + export from `analytics/transforms/index.ts` |
| Add chart adapter    | `charts/adapters/` + export from `charts/adapters/index.ts`           |
| Tune chart options   | `charts/config/defaults.ts`                                           |
| Format display value | `formatters/`                                                         |
| Add theme            | `themes/models/constants.ts`                                          |
| Debug logging        | Import from `loggers/constants.ts`                                    |

## CONVENTIONS

### Module Structure

```
{module}/
├── index.ts           # Public API (functions only)
├── models/            # Types and interfaces
│   └── index.ts       # Type barrel
├── store.ts           # Svelte store (if stateful)
├── state.ts           # State definition (empty, normalize, equal)
└── *.spec.ts          # Colocated tests
```

### Logger Usage

```typescript
import { csv } from '$lib/loggers'
const log = csv.extends('parser')
log.debug('parsing file: %s', filename)
```

### Filter Pattern

```typescript
export const byX: FilterByFunc<[Args]> = (args): FilterBy => {
	const by: FilterBy = (trx /* return boolean */) => (by.type = 'X')
	return by
}
```

### Transform Pattern

```typescript
export const byX: TransformByFunc<Args, Output> = (
	args
): TransformBy<Output> => {
	const by: TransformBy<Output> = (trxs /* return aggregated data */) =>
		(by.type = 'X')
	return by
}
```

## ANTI-PATTERNS

- Don't import Svelte components here (use `$components`)
- Don't access IndexedDB directly (use store APIs from `csv/apis.ts`)
- Don't put UI-specific code in transforms/filters
- Don't export types from domain `index.ts` files (use `models/`)
- Don't load fixtures or source data from `static/data` or
  `static/database`; CI workflows do not include those paths.

## REFERENCE DOCS (REQUIRED)

- For any read/write/modify/condition change related to CSV behavior, consult
  [RULES.md](../../RULES.md).
- For any read/write/modify/condition change related to SQLite/database
  behavior, consult [DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md).

## MONEYWIZ CSV FORMAT

MoneyWiz CSV exports have a specific structure with account header rows that must be skipped during import.

### CSV Structure

```csv
sep=,
"Name","Current balance","Account","Transfers","Description","Payee","Category","Date","Time","Memo","Amount","Currency","Check #","Tags","Balance"
"Cash wallet [THB] (W)","1,380.00","THB","","","","","","","","","","","",""   ← Account header (skip)
"","","Cash wallet [THB] (W)","","Description","Payee","Category","21/12/2025","20:33","","-310.00","THB","","","1,380.00"   ← Transaction row
```

### Account Header Rows

- Have `Name` column filled (account name)
- Have `Date` column empty
- These are balance summary rows, NOT transactions
- Use `isAccountHeaderRow()` from `transactions/csv.ts` to detect and skip

### Transaction Rows

- Have `Name` column empty
- Have `Date` column filled
- `Account` column contains the account name
- `Transfers` column non-empty indicates a transfer transaction

## NOTES

- `lib/components/` contains TypeScript utilities for component styling, NOT Svelte components
- Filters compose with `byAND`, `byOR`, `byNOT`
- All logging uses `debug` package; enable via `DEBUG=*` or `DEBUG=libs:*`
- `transactions/db.ts` currently has a TODO for storage initialization
