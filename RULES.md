# MoneyWiz CSV Analyzer - Logic Summary

## Repository Constraint

- `static/data/` and `static/database/` are gitignored local folders.
- Do not use them as runtime/test data sources or as required inputs for docs.
- For tests, generate fixtures inline (for example with
  `e2e/utils/csv-generator.ts`).

- [1. CSV Parsing Rules](#1-csv-parsing-rules)
  - [1.1 File Preprocessing](#11-file-preprocessing)
  - [1.2 CSV Structure](#12-csv-structure)
  - [1.3 Row Classification](#13-row-classification)
  - [1.4 Field Parsing](#14-field-parsing)
    - [Date Parsing](#date-parsing)
    - [Amount Parsing](#amount-parsing)
    - [Category Parsing](#category-parsing)
    - [Account Parsing](#account-parsing)
    - [Tag Parsing](#tag-parsing)
  - [1.5 Transaction Classification](#15-transaction-classification)
- [2. Filter Chain (Applied in UI)](#2-filter-chain-applied-in-ui)
  - [Tag Filter Logic](#tag-filter-logic)
  - [Category Filter Logic](#category-filter-logic)
- [3. Special Category Handling](#3-special-category-handling)
- [4. Category Tree Structure](#4-category-tree-structure)

## 1. CSV Parsing Rules

### 1.1 File Preprocessing

Before parsing, the CSV file is preprocessed:

1. **BOM removal**: Strip UTF-8 BOM (`\uFEFF`) if present
2. **Line splitting**: Split by `\r?\n` (Unix and Windows line endings)
3. **Empty line skipping**: Skip leading empty lines
4. **Separator preamble detection**: MoneyWiz exports may start with `sep=,`
5. **Empty line filtering**: Remove all empty lines from content

**Separator preamble example:**

```csv
sep=,
"Name","Current balance","Account",...
```

### 1.2 CSV Structure

MoneyWiz exports use these column headers:

| Column          | CSV Key       | Description                        |
| --------------- | ------------- | ---------------------------------- |
| Name            | `Name`        | Account name (header rows only)    |
| Current balance | -             | Account balance (header rows only) |
| Account         | `Account`     | Account name for transaction       |
| Transfers       | `Transfers`   | Target account for transfers       |
| Description     | `Description` | Transaction description            |
| Payee           | `Payee`       | Payee name                         |
| Category        | `Category`    | Category (hierarchical)            |
| Date            | `Date`        | Transaction date                   |
| Time            | `Time`        | Transaction time                   |
| Memo            | `Memo`        | Additional notes                   |
| Amount          | `Amount`      | Transaction amount                 |
| Currency        | `Currency`    | Currency code                      |
| Check #         | `Check #`     | Check number                       |
| Tags            | `Tags`        | Tag list                           |
| Balance         | -             | Running balance (not parsed)       |

### 1.3 Row Classification

During import, each CSV row is classified before transaction parsing:

| Condition                                  | Classification      | Action                   |
| ------------------------------------------ | ------------------- | ------------------------ |
| `Name` filled AND `Current balance` filled | **Account Header**  | Skip (not a transaction) |
| otherwise                                  | **Transaction Row** | Parse as transaction     |

**Account header example:**

```csv
"Cash wallet [THB] (W)","1,380.00","THB","","","","","","","","","","","",""
```

### 1.4 Field Parsing

#### Date Parsing

- **Format**: `DD/MM/YYYY` with optional `HH:MM`
- **Output**: JavaScript `Date`
- **Empty date**: Returns `new Date(0)`

#### Amount Parsing

- **Format**: `1,234.56` or `-1,234.56`
- **Processing**: Strip commas, parse float
- **NaN handling**: Returns `0` for invalid values
- **Default currency**: `THB` if not specified

#### Category Parsing

- **Format**: `Parent > Child` or `Parent ► Child`
- **Output**: `{ category: string, subcategory: string }`
- **Single level**: `{ category: "Food", subcategory: "" }`
- **Two levels**: `{ category: "Food", subcategory: "Restaurants" }`

#### Account Parsing

- **Format**: `<name> [<extra>] (<type>)`
- **Components**:
  - `name`: account display name
  - `extra`: optional metadata in `[]`
  - `type`: account type code in `()`

| Code | Account Type   |
| ---- | -------------- |
| `A`  | Checking       |
| `C`  | CreditCard     |
| `D`  | DebitCard      |
| `I`  | Investment     |
| `L`  | Loan           |
| `W`  | Wallet         |
| `OW` | OnlineWallet   |
| `CT` | Cryptocurrency |
| -    | Unknown        |

#### Tag Parsing

- **Format**: `category: name; category2: name2`
- **Output**: `Array<{ category: string, name: string }>`
- **Special mapping**: `Zvent` -> `Event`
- **No category**: `{ category: "", name: "tag" }`

### 1.5 Transaction Classification

Transactions are classified in this priority order:

| Priority | Condition                                                                       | Type                            |
| -------- | ------------------------------------------------------------------------------- | ------------------------------- |
| 1        | Category = `Other Expenses > Debt`                                              | `Debt`                          |
| 2        | Category = `Other Incomes > Debt Repayment`                                     | `DebtRepayment`                 |
| 3        | Category = `Other Incomes > Windfall`                                           | `Windfall`                      |
| 4        | Category = `Other Expenses > Giveaways`                                         | `Giveaway`                      |
| 5        | `Category` empty AND `Description` = `new balance` (CI)                         | `NewBalance`                    |
| 6        | `Transfers` filled AND `Category` filled                                        | `Income` / `Expense` / `Refund` |
| 7        | `Transfers` filled AND `Category` empty                                         | `Transfer`                      |
| 8        | Account = Investment AND `Category` empty AND `Amount > 0`                      | `Sell`                          |
| 9        | Account = Investment AND `Category` empty AND `Amount < 0`                      | `Buy`                           |
| 10       | `Amount > 0` AND category parent is in income prefixes                          | `Income`                        |
| 11       | `Amount < 0`                                                                    | `Expense`                       |
| 12       | `Category` filled AND category parent NOT in income prefixes AND no prior match | `Refund`                        |
| 13       | No prior match                                                                  | `Unknown`                       |

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
