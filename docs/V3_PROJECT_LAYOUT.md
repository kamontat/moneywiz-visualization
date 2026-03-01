# Project layout

New version of project layout (v3).

## Workflow

- When load page
    - Load snapshot from indexdb
    - Rebuilt snapshot from OPFS
    - Return empty page
- When user click upload file
    - Upload file to OPFS
    - Rebuilt snapshot and use it
- When user click clear
    - Remove file from OPFS
    - Remove snapshot from indexdb
    - Show empty page

## Dependencies rule

- **src/routes** / **$components** can import
    - $lib/ui
    - $lib/app
    - $lib/types
    - $lib/utils
- **$lib/ui** can import
    - $lib/types
    - $lib/utils
- **$lib/app** can import
    - $lib/apis
    - $lib/utils
- **$lib/apis** can import
    - $lib/apis
    - $lib/providers
    - $lib/utils
- **$lib/providers** can import
    - $lib/utils
- **$lib/utils** can import
    - $lib/utils

## $lib/app

Contains business logic, orchestration, and application state.

### $lib/app/controllers

Controllers for workflow orchestration.

- Orchestrate data workflows (when to load from OPFS vs snapshot)
- Choose appropriate pipelines from `$lib/apis` for specific UI use cases

### $lib/app/sessions

Manage application state session with svelte-store support.

On bootstrap:
- Use indexdb provider to load snapshot data (if needed)
- Use sqliteApi to bootstrap sqlite data (if needed)

On upload:
- Use sqliteApi to upload sqlite data
- Use indexdb provider to save snapshot data

```typescript
type ClearPhase = 'remove_snapshot' | 'remove_file' | 'complete'
interface ClearProgress {
  phase: ClearPhase
}

type ClearStatus = 'passed' | 'failed'
interface ClearResult {
  status: ClearStatus
  message: string
  duration: number
}

interface SessionStore {
  /**
   * 1. initiate sqlite worker
   * 2. Load snapshot from indexdb
   * 3. if snapshot missing, try load sqlite from opfs and rebuilt snapshot
   */
  bootstrap(): [Readable<BootstrapProgress>, Promise<BootstrapResult>]

  /**
   * 1. upload sqlite to opfs
   * 2. save snapshot to indexdb
   */
  upload(file: File): [Readable<UploadProgress>, Promise<UploadResult>]

  /**
   * 1. remove sqlite from opfs
   * 2. remove snapshot from indexdb
   */
  clear(): [Readable<ClearProgress>, Promise<ClearResult>]
}
```

## $lib/apis

Contains pure data access and management APIs.

### $lib/apis/pipelines

Composable data transformation layer over DataRecord.
Receives **DataRecord** from `$lib/apis/record` and
produces derived views consumed by `$lib/app`.

- $lib/apis/pipelines/types - internal types

```typescript
type FilterFn<I> = (input: I[]) => I[]
type MapFn<I, O> = (input: I[]) => O[]
type ReduceFn<I, O> = (init: O, input: I[]) => O
```

- $lib/apis/pipelines/filters/index.ts
    - $lib/apis/pipelines/filters/byXXX.ts
- $lib/apis/pipelines/maps/index.ts
    - $lib/apis/pipelines/maps/byXXX.ts
- $lib/apis/pipelines/reduces/index.ts
    - $lib/apis/pipelines/reduces/byXXX.ts

### $lib/apis/record

Create record apis to parse data from sqlite.

Directory layout should be as following:
- $lib/apis/record/index.ts - entrypoint for import
- $lib/apis/record/types.ts - internal types

```typescript
type Querier<DB extends Queriable, R> = (db: DB) => Promise<R>
type Classifier<R, D extends DataRecord> = (raw: R) => Promise<D>
```

The workflow of record apis is as following:
- Use querier to query data to raw object
    - querier/index.ts - entrypoint for import
    - querier/types.ts - Raw object
    - querier/query.ts - query sqlite to raw object
- Use classifier to classify raw object to expected data object
    - classifier/index.ts - entrypoint for import
    - querier/types.ts - DataRecord object
    - classifier/classify.ts - classify raw to data object
    - classifier/rules/*.ts - classification rules

Below section is the example of record implementation
for account list and transaction list.

#### $lib/apis/record/accounts

```typescript
interface DataBaseAccount {
  id: number
  name: string
  /* TODO: implement transaction record */
}
interface DataCheckingAccount extends DataBaseAccount {
  type: "checking"
  /* TODO: implement transaction record */
}
interface DataCreditCardAccount extends DataBaseAccount {
  type: "creditcard"
  /* TODO: implement transaction record */
}
// ... (more types)
type DataAccount =
  | DataCheckingAccount
  | DataCreditCardAccount
interface DataAccounts extends DataRecord {
  accounts: DataAccount[]
}
```

#### $lib/apis/record/transactions

```typescript
interface DataBaseTransaction {
  /* TODO: implement transaction record */
}
interface DataExpenseTransaction extends DataBaseTransaction {
  type: "expense"
  /* TODO: implement transaction record */
}
interface DataIncomeTransaction extends DataBaseTransaction {
  type: "income"
  /* TODO: implement transaction record */
}
// ... (more types)
type DataTransaction =
  | DataExpenseTransaction
  | DataIncomeTransaction
interface DataTransactions extends DataRecord {
  transactions: DataTransaction[]
}
```

- $lib/apis/record/v1.ts - apis v1

The RecordGetter should do as following:
- Use snapshot data (if existed)
- Use querier to query data to raw object
- Use classifier to classify raw object to expected data object

```typescript
type RecordGetter<D extends DataRecord> = () => Promise<D>

interface RecordApiV1 extends Versionable<"record", 1> {
  getAccounts: RecordGetter<DataAccounts>
  getTransactions: RecordGetter<DataTransactions>
  // ... (more methods)
}
```

### $lib/apis/sqlite

Create sqlite apis and web-worker.

This will depends on **$lib/providers** to read/write data from
both OPFS (sqlite file) and indexdb (snapshot).

**Important rule** is all SQLite parsing and extracting must
run inside the worker thread only.
And the client module is a main-thread façade that
communicates with the worker via message passing.
No SQLite logic may run on the main thread.

```typescript
type OnProgress<S> = (state: S) => void

type BootstrapPhase =
  | 'source_import'  // import source from opfs
  | 'snapshot_write' // save snapshot to indexdb
  | 'snapshot_load'  // load snapshot from indexdb
  | 'complete'
interface BootstrapProgress {
  phase: BootstrapPhase
  processed: number
  error: number
  total: number
}

// missed when neither sqlite or snapshot is available
// rebuilt when opfs sqlite available, but no snapshot
// reused when indexdb snapshot available
type BootstrapMode = 'missed' | 'rebuilt' | 'reused'
// when mode is missed, status will always be missed
// passed when rebuilt or reused successfully
// failed when rebuilt or reused failed
type BootstrapStatus = 'missed' | 'passed' | 'failed'
interface BootstrapResult {
  mode: BootstrapMode
  status: BootstrapStatus
  /** Message of the result for show to user */
  message: string
  /** duration in ms */
  duration: number
}

type UploadPhase = 'import' | 'complete'
interface UploadProgress {
  phase: UploadPhase
  processed: number
  error: number
  total: number
}

type UploadStatus = 'passed' | 'failed'
interface UploadResult {
  status: UploadStatus
  /** Message of the result for show to user */
  message: string
  /** duration in ms */
  duration: number
}

interface SqliteApiV1 extends Versionable<"sqlite", 1>, Queriable {
  bootstrap(
    onProgress?: OnProgress<BootstrapProgress>
  ): Promise<BootstrapResult>
  upload(
    file: File,
    onProgress?: OnProgress<UploadProgress>
  ): Promise<UploadResult>
}
declare const sqlite: SqliteApiV1
```

#### $lib/apis/sqlite/worker

Entrypoint for web-worker

#### $lib/apis/sqlite/client

Entrypoint for client (main-thread façade for sqlite web-worker)

### $lib/apis/bank

Create bank apis

- $lib/apis/bank/currency

```typescript
type CurrencyConverter = (amount: number, from: string, to: string) => Promise<number>
```

- $lib/apis/bank/index.ts

```typescript
interface BankApiV1 extends Versionable<"bank", 1> {
  convertCurrency: CurrencyConverter
  // ...
}
declare const bank: BankApiV1
```

## $lib/providers

Contains data provider (storage backends) that the app reads from and writes to.

### $lib/providers/astorage

A synchronous storage provider backed by the browser's `Storage`.

```typescript
class AStorageProvider<N extends string, V extends number>
  extends Versionable<N, V> {
  constructor(
    readonly name: N,
    readonly version: V,
    private readonly storage: Storage,
  ) {}

  has(key: string): boolean
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T): void
  delete(key: string): void
  clear(): void
  keys(): string[]
}

export const lstorage = setupAStorageProvider("localStorage", 1,
  (w) => w.localStorage,
)
export const tstorage = setupAStorageProvider("sessionStorage", 1,
  (w) => w.sessionStorage,
)
```

### $lib/providers/indexdb

An asynchronous storage provider backed by the browser's `indexedDB`.

```typescript
type TransactionCallback<R> = (trx: IDBPTransaction) => Promise<R>

interface IndexdbTable<T extends string> {
  readonly table: T

  has(key: string): Promise<boolean>
  get<R>(key: string): Promise<R | undefined>
  set<R>(key: string, value: R): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>

  transaction<R>(
    mode: IDBTransactionMode,
    cb: TransactionCallback<R>,
  ): Promise<R>
}

class IndexdbProviderV1 extends Versionable<"indexdb", 1> {
  constructor(private readonly engine: Promise<IDBPDatabase>) {}

  table<T extends string>(name: T): IndexdbTable<T>
  transaction<R>(
    tables: string[],
    mode: IDBTransactionMode,
    cb: TransactionCallback<R>,
  ): Promise<R>
}
export const indexdb = setupIDBProviderV1()
```

### $lib/providers/opfs

An asynchronous file storage provider backed by the browser's Origin Private File System (OPFS).

```typescript
class OpfsProviderV1 extends Versionable<"opfs", 1> {
  constructor(private readonly handler: Promise<FileSystemDirectoryHandle>) {}

  has(filename: string): Promise<boolean>
  read(filename: string): Promise<File | undefined>
  write(filename: string, data: File | Blob | ArrayBuffer): Promise<void>
  delete(filename: string): Promise<void>
  clear(): Promise<void>
  files(): Promise<string[]>
}

export const opfs = setupOpfsProviderV1()
```

## $lib/ui

Contains pure UI utilities, components.

**Responsibilities:**
- Component prop types and interfaces
- UI helpers (className utilities, styling)
- Svelte-specific utilities (actions, stores, runes)
- Theme management and visual concerns
- No business logic or data decisions

**Contains:**
- Component prop types and interfaces
- UI utility functions and helpers
- Theme and styling management
- Svelte-specific utilities

### $lib/ui/components

- prop types
- className utilities

### $lib/ui/charts

charts management

### $lib/ui/notifications

notifications management

### $lib/ui/themes

theme management

## $lib/utils

Shared, framework-agnostic utilities used across $lib.
Contains pure functions and factories with no dependency on
Svelte, browser APIs, or domain models.

### $lib/utils/formatters

Formatting data utilities.

- $lib/utils/formatters/index.ts
- $lib/utils/formatters/base.ts - contains internal types
- $lib/utils/formatters/amount.ts
- $lib/utils/formatters/currency.ts

```typescript
type Formatter<T> = (value: T) => string

const formatAmount: Formatter<DataAmount>;
const formatCurrency: Formatter<DataCurrency>;
// ... (more formatters)
```

### $lib/utils/loggers

loggers factory

```typescript
interface Logger {
  readonly namespace: string
  extends(...ns: string[]): Logger
  debug(formatter: string, ...args: unknown[]): void
  info(formatter: string, ...args: unknown[]): void
  warn(formatter: string, ...args: unknown[]): void
  error(formatter: string, ...args: unknown[]): void
}

export class LoggerFactory {
  static create(...ns: string[]): Logger {}
}
```

## $lib/types

All types should be imported from `$lib/types`
except internal only types (the type which only use in single directory)

### $lib/types/version

Versionable models

```typescript
interface Versionable<N extends string, V extends number> {
  readonly name: N
  readonly version: V
}
```

### $lib/types/queriable

Queriable models

```typescript
interface Queriable {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>
}
```

### $lib/types/record

Data record models

- $lib/types/record/base

```typescript
interface DataRecord {
  /** Name of record */
  name: string
  type: string
}
```

## $components

Contains all Svelte `.svelte` component files, organized by complexity. No business logic.

### $components/atoms

Smallest, self-contained UI elements with no composition (e.g. buttons, badges, icons, inputs). No dependencies on other components.

### $components/molecules

Composed of atoms; represent a single cohesive UI unit (e.g. form fields, card headers, labeled values). May have light local state.

### $components/organisms

Complex, domain-aware sections composed of molecules and atoms (e.g. account list, file upload panel, navigation bar). May connect to $lib/app stores.

## $css

Contains global CSS files — base styles, CSS custom properties (design tokens), and any third-party style overrides.

## src/routes

Contains SvelteKit page and layout routes. No business logic.
