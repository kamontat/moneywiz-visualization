# src/lib — Domain Modules

## OVERVIEW

Domain-specific business logic organized by feature. Each module is self-contained with barrel exports via `index.ts`.

## STRUCTURE

```
lib/
├── analytics/          # Data transforms and filters for visualization
│   ├── filters/        # Filter transactions (byCurrency, byDateRange, byTags)
│   └── transforms/     # Aggregate data (byCategoryTotal, byTimeSeries, bySummarize)
├── csv/                # CSV parsing and persistence via IndexedDB
├── transactions/       # Transaction models, parsing, store
├── themes/             # Theme state, store, DaisyUI theme switching
├── formatters/         # Amount, date, category display formatters
├── loggers/            # Debug logging with namespaced loggers
└── components/         # Component utilities (NOT Svelte components)
```

## WHERE TO LOOK

| Task                 | Location                                         |
| -------------------- | ------------------------------------------------ |
| Parse CSV            | `csv/parser.ts` (PapaParse)                      |
| Add filter           | `analytics/filters/` + export from `index.ts`    |
| Add transform        | `analytics/transforms/` + export from `index.ts` |
| Format display value | `formatters/`                                    |
| Add theme            | `themes/models/constants.ts`                     |
| Debug logging        | Import from `loggers/constants.ts`               |

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

## NOTES

- `lib/components/` contains TypeScript utilities for component styling, NOT Svelte components
- Filters compose with `byAND`, `byOR`, `byNOT`
- All logging uses `debug` package; enable via `DEBUG=*` or `DEBUG=libs:*`
