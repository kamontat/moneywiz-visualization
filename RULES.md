# MoneyWiz SQLite Analyzer - Logic Summary

## Repository Constraint

- `static/data/` and `static/database/` are gitignored local folders.
- Do not use them as runtime/test data sources or as required inputs for docs.
- For tests, generate fixtures in code.

- [1. SQLite Import Rules](#1-sqlite-import-rules)
  - [1.1 File Loading](#11-file-loading)
  - [1.2 Database Structure](#12-database-structure)
  - [1.3 Entity Type Mapping](#13-entity-type-mapping)
  - [1.4 Field Conversion](#14-field-conversion)
    - [Date Conversion](#date-conversion)
    - [Amount Conversion](#amount-conversion)
    - [Category Conversion](#category-conversion)
    - [Account Type Mapping](#account-type-mapping)
    - [Tag Conversion](#tag-conversion)
  - [1.5 Transaction Classification](#15-transaction-classification)
- [2. Filter Chain (Applied in UI)](#2-filter-chain-applied-in-ui)
  - [Tag Filter Logic](#tag-filter-logic)
  - [Category Filter Logic](#category-filter-logic)
- [3. Special Category Handling](#3-special-category-handling)
- [4. Category Tree Structure](#4-category-tree-structure)

## 1. SQLite Import Rules

### 1.1 File Loading

The SQLite file is loaded in the browser using `@sqlite.org/sqlite-wasm`:

1. **Read file**: Read as `ArrayBuffer`
2. **WAL patch**: If header bytes 18-19 indicate WAL mode, patch to legacy
3. **Deserialize**: Load into in-memory SQLite via `sqlite3_deserialize`
4. **Lookup tables**: Parse `Z_PRIMARYKEY` for entity name mapping
5. **Extract data**: Parse accounts, payees, categories, tags, users
6. **Build relations**: Map categories and tags to transactions
7. **Parse transactions**: Convert `ZSYNCOBJECT` rows to `SQLiteTransaction`

### 1.2 Database Structure

MoneyWiz uses a Core Data SQLite schema with:

- **`Z_PRIMARYKEY`**: Maps entity IDs (`Z_ENT`) to logical model names
- **`ZSYNCOBJECT`**: Polymorphic table storing all entity subtypes
- **`ZCATEGORYASSIGMENT`**: Links transactions to categories
- **`Z_36TAGS`**: Links transactions to tags

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for the full ER diagram.

### 1.3 Entity Type Mapping

SQLite entity names map to transaction entity types:

| Entity Name                   | Z_ENT | Role                 |
| ----------------------------- | ----- | -------------------- |
| `DepositTransaction`          | 37    | Income/Refund        |
| `WithdrawTransaction`         | 47    | Expense              |
| `TransferDepositTransaction`  | 45    | Transfer (receiving) |
| `TransferWithdrawTransaction` | 46    | Transfer (sending)   |
| `TransferBudgetTransaction`   | 44    | Transfer (budget)    |
| `InvestmentBuyTransaction`    | 40    | Buy                  |
| `InvestmentSellTransaction`   | 41    | Sell                 |
| `ReconcileTransaction`        | 42    | NewBalance           |
| `RefundTransaction`           | 43    | Refund               |

### 1.4 Field Conversion

#### Date Conversion

- **Source**: Core Data timestamp (seconds since 2001-01-01 00:00:00 UTC)
- **Conversion**: `new Date(APPLE_REFERENCE_EPOCH_MS + timestamp * 1000)`
- **Output**: JavaScript `Date`
- **Missing date**: Returns `new Date(0)`

#### Amount Conversion

- **Source**: `ZAMOUNT` / `ZAMOUNT1` numeric columns
- **Output**: `{ value: number, currency: string }`
- **Default currency**: `THB` if not available from account or transaction
- **Missing amount**: Returns `0`

#### Category Conversion

- **Source**: `ZCATEGORYASSIGMENT` join table → `SQLiteCategoryRef`
- **Format**: `parentName > name` (when parent exists)
- **Output**: `{ category: string, subcategory: string }`
- **No categories**: Empty string (treated as no category)

#### Account Type Mapping

Account types are derived from the SQLite entity ID of the account:

| Entity Name         | Z_ENT | Account Type |
| ------------------- | ----- | ------------ |
| `CashAccount`       | 12    | Wallet       |
| `BankChequeAccount` | 10    | Checking     |
| `BankSavingAccount` | 11    | Checking     |
| `CreditCardAccount` | 13    | CreditCard   |
| `LoanAccount`       | 14    | Loan         |
| `InvestmentAccount` | 15    | Investment   |
| `ForexAccount`      | 16    | Unknown      |

#### Tag Conversion

- **Source**: `Z_36TAGS` join table → `SQLiteTagRef`
- **Output**: `Array<{ category: string, name: string }>`
- **Category**: Parsed from tag name via `"Category: Name"` encoding (e.g. `"Group: KcNt"` → `{ category: 'Group', name: 'KcNt' }`)
- **Alias**: `Zvent` is mapped to `Event` by `parseTag()`
- **No category**: Tags without `": "` separator get `category: ""` and are excluded from filter grouping

### 1.5 Transaction Classification

Transactions are classified in this priority order:

| Priority | Condition                                                                       | Type                            |
| -------- | ------------------------------------------------------------------------------- | ------------------------------- |
| 1        | Category = `Other Expenses > Debt`                                              | `Debt`                          |
| 2        | Category = `Other Incomes > Debt Repayment`                                     | `DebtRepayment`                 |
| 3        | Category = `Other Incomes > Windfall`                                           | `Windfall`                      |
| 4        | Category = `Other Expenses > Giveaways`                                         | `Giveaway`                      |
| 5        | Entity = `ReconcileTransaction` (42)                                            | `NewBalance`                    |
| 6        | `Category` empty AND `Description` = `new balance` (CI)                         | `NewBalance`                    |
| 7        | Entity is Transfer type AND `Category` filled                                   | `Income` / `Expense` / `Refund` |
| 8        | Entity is Transfer type AND `Category` empty                                    | `Transfer`                      |
| 9        | Entity = `RefundTransaction` (43)                                               | `Refund`                        |
| 10       | Entity = `InvestmentBuyTransaction` (40)                                        | `Buy`                           |
| 11       | Entity = `InvestmentSellTransaction` (41)                                       | `Sell`                          |
| 12       | Account = Investment AND `Category` empty AND `Amount > 0`                      | `Sell`                          |
| 13       | Account = Investment AND `Category` empty AND `Amount < 0`                      | `Buy`                           |
| 14       | `Amount > 0` AND category parent is in income prefixes                          | `Income`                        |
| 15       | `Amount < 0`                                                                    | `Expense`                       |
| 16       | `Category` filled AND category parent NOT in income prefixes AND no prior match | `Refund`                        |
| 17       | No prior match                                                                  | `Unknown`                       |

**Income category prefixes:**

- `Compensation`
- `Other Incomes`

## 2. Filter Chain (Applied in UI)

In `src/routes/+page.svelte`, filters are applied in this order when selected:

1. Date range (`byDateRange`)
2. Transaction type include filter (`byTransactionType`)
3. Category include filter (`byCategory` with `mode: 'include'`)
4. Tag filters (`byTags`)

### Tag Filter Logic

- Multiple tag categories use **AND** logic
- Values inside one tag category use **OR** logic
- Mode per category: `include` or `exclude`

### Category Filter Logic

- `byCategory` supports both `include` and `exclude`
- Current page UI applies it in `include` mode
- Matching includes exact category and descendants (`Parent > Child`)

## 3. Special Category Handling

Special categories are classified first and get dedicated transaction types:

| Category                         | Type            |
| -------------------------------- | --------------- |
| `Other Expenses > Debt`          | `Debt`          |
| `Other Incomes > Debt Repayment` | `DebtRepayment` |
| `Other Expenses > Giveaways`     | `Giveaway`      |
| `Other Incomes > Windfall`       | `Windfall`      |

These are not globally auto-excluded by default filtering. They are surfaced
as separate totals in summary/time-series transforms.

## 4. Category Tree Structure

Category trees are built per transaction type (`Expense` and `Income` only):

- Transactions without categories are skipped
- Child label defaults to `(uncategorized)` when empty
- Parent total = sum of child absolute amounts
- Parent percentage = parent total / grand total
- Child percentage = child total / parent total

Refunds are not part of the category tree because the tree is built only from
`Expense` or `Income` transaction types.
