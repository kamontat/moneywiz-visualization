# src/lib — Domain Modules

## OVERVIEW

Domain-specific business logic organized by feature. Each module is self-contained with barrel exports via `index.ts`.

## STRUCTURE

```
lib/
├── analytics/          # Data transforms and filters for visualization
│   ├── filters/        # Filter transactions (byCurrency, byDateRange, byTags)
│   └── transforms/     # Aggregate data (byCategoryTotal, byTimeSeries, bySummarize)
├── csv/                # CSV metadata state/store APIs
├── transactions/       # Transaction models, classification, import
├── themes/             # Theme state, store, DaisyUI theme switching
├── formatters/         # Amount, date, category display formatters
├── loggers/            # Debug logging with namespaced loggers
└── components/         # Component utilities (NOT Svelte components)
```

## WHERE TO LOOK

| Task                 | Location                                                |
| -------------------- | ------------------------------------------------------- |
| Parse CSV            | `transactions/import.ts` + `transactions/classifier.ts` |
| Add filter           | `analytics/filters/` + export from `index.ts`           |
| Add transform        | `analytics/transforms/` + export from `index.ts`        |
| Format display value | `formatters/`                                           |
| Add theme            | `themes/models/constants.ts`                            |
| Debug logging        | Import from `loggers/constants.ts`                      |

## CONVENTIONS

### Module Structure

```
{module}/
├── index.ts           # Barrel exports (public API)
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
