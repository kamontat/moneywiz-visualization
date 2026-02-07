# src/utils — Data Layer

## OVERVIEW

Schema-first persistence layer: IndexedDB + localStorage with cross-tab sync via storage events. Svelte stores backed by DB.

## STRUCTURE

```
utils/
├── db/                 # Database abstraction
│   ├── indexdb.ts      # IndexedDB implementation (async, idb library)
│   ├── localdb.ts      # localStorage implementation (sync)
│   ├── models/         # Database interfaces and schema types
│   └── utils.ts        # Helpers (parseDBFullName, parseChangedData)
├── stores/             # Svelte stores with persistence
│   ├── store.ts        # newStore: writable + DB persistence
│   ├── db.ts           # Concrete DB instances (localDBV1, indexDBV1)
│   └── models/         # Store types and StoreSchema
├── states/             # State management primitives
│   ├── state.ts        # newState: creates State with normalize/equal/merge
│   └── models/         # State interfaces
├── types/              # Shared TypeScript utilities
│   ├── record.ts       # DeepPartial, ToObj, ToKey
│   ├── keys.ts         # ObjKeyArray
│   ├── keyval.ts       # ToKVs, AnyKeyVal
│   └── promise.ts      # PromiseOrVal, WithPromiseLike
└── apis/               # API wrapper factory
```

## WHERE TO LOOK

| Task                    | Location                                |
| ----------------------- | --------------------------------------- |
| Add new persisted store | See "Adding a Store" below              |
| Add DB table            | `stores/models/schema.ts` (StoreSchema) |
| Create IndexedDB store  | `stores/db.ts` (upgrade callback)       |
| Type utilities          | `types/`                                |

## CONVENTIONS

### Adding a Store

1. **Define schema** in `stores/models/schema.ts`:

```typescript
export type StoreSchema = ISchemaDB<{
	'v1:mystore': ISchemaTable<{ myKey: ISchemaState<string, MyValue> }>
}>
```

2. **Create State** in your domain module:

```typescript
import { newState } from '$utils/states'
export const myState = newState<MyValue>(defaultValue, {
  normalize: (v) => /* ... */,
  equal: (a, b) => /* ... */,
})
```

3. **Create Store** with context:

```typescript
import { newStore, indexDBV1 } from '$utils/stores'
export const myStore = newStore(indexDBV1, myState, {
	log: myLogger,
	get: (db) => db.get('myKey'),
	set: (db, val) => db.set('myKey', val),
	del: (db) => db.delete('myKey'),
})
```

### Cross-Tab Sync

- DB writes trigger localStorage event via `db.trigger()`
- Other tabs listen via `db.onChange()` or `db.onChangeByKey()`
- Trigger contains minimal data; actual value read from DB

### State Functions

| Function    | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| `empty`     | Default/initial value                                  |
| `normalize` | Clean/validate incoming data                           |
| `equal`     | Compare for change detection (skip unnecessary writes) |
| `merge`     | Deep merge partial updates                             |

### DB Naming

- Format: `v{version}:{name}` (e.g., `v1:csv`)
- Parsed by `parseDBFullName()`

## ANTI-PATTERNS

- Don't use localStorage directly; use DB abstraction
- Don't skip `normalize` when creating state (prevents invalid data)
- Don't call `db.set` without going through store (breaks change tracking)
- Don't put UI logic here; this is data layer only
