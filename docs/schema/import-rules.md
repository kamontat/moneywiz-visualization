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

See the [Mermaid ER Diagram](#mermaid-er-diagram) section above for the full schema.

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
| `ReconcileTransaction`        | 42    | Reconcile            |
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
- **Analytics normalization target**: `THB` (historical conversion at transaction date)

#### Analytics Currency Normalization

Analytics values are normalized to THB with this priority:

1. **Exact raw THB amount**: When transaction raw data includes both
   `amount` (THB) and `originalAmount` (foreign), and magnitudes differ,
   use raw `amount` directly.
2. **Historical date rate**: For remaining non-THB values, convert using
   historical FX near the transaction date (same day or nearest prior
   market day).
3. **Unresolved fallback**: If no rate can be resolved, the transaction is
   excluded from analytics totals and surfaced in warning metadata.

Historical rates are cached in local storage-backed state to avoid
refetching during filter/tab interactions.

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

**Pre-import filtering:**

- Transactions with no category and a description matching "new balance"
  (case-insensitive) are excluded during import and never reach
  classification.
- Transactions classified as `Income` or `Expense` with missing payee or
  missing category are excluded during import (legacy incomplete records).

Transactions are classified in this priority order:

| Priority | Condition                                                                       | Type                            |
| -------- | ------------------------------------------------------------------------------- | ------------------------------- |
| 1        | Category = `Other Expenses > Debt`                                              | `Debt`                          |
| 2        | Category = `Other Incomes > Debt Repayment`                                     | `DebtRepayment`                 |
| 3        | Category = `Other Incomes > Windfall`                                           | `Windfall`                      |
| 4        | Category = `Other Expenses > Giveaways`                                         | `Giveaway`                      |
| 5        | Entity = `ReconcileTransaction` (42)                                            | `Reconcile`                     |
| 6        | Entity is Transfer type AND `Category` filled                                   | `Income` / `Expense` / `Refund` |
| 7        | Entity is Transfer type AND `Category` empty                                    | `Transfer`                      |
| 8        | Entity = `RefundTransaction` (43)                                               | `Refund`                        |
| 9        | Entity = `InvestmentBuyTransaction` (40)                                        | `Buy`                           |
| 10       | Entity = `InvestmentSellTransaction` (41)                                       | `Sell`                          |
| 11       | Account = Investment AND `Category` empty AND `Amount > 0`                      | `Sell`                          |
| 12       | Account = Investment AND `Category` empty AND `Amount < 0`                      | `Buy`                           |
| 13       | `Amount > 0` AND category parent is in income prefixes                          | `Income`                        |
| 14       | `Amount < 0`                                                                    | `Expense`                       |
| 15       | `Category` filled AND category parent NOT in income prefixes AND no prior match | `Refund`                        |
| 16       | No prior match                                                                  | `Unknown`                       |

**Income category prefixes:**

- `Compensation`
- `Other Incomes`
