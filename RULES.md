# MoneyWiz CSV Analyzer — Logic Summary

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
- [2. Filter Chain (Applied in Order)](#2-filter-chain-applied-in-order)
  - [Tag Filter Logic](#tag-filter-logic)
  - [Category Filter Logic](#category-filter-logic)
- [3. Special Category Handling](#3-special-category-handling)
- [4. Category Tree Structure](#4-category-tree-structure)

## 1. CSV Parsing Rules

### 1.1 File Preprocessing

Before parsing, the CSV file is preprocessed:

1. **BOM Removal**: Strip UTF-8 BOM (`\uFEFF`) if present
2. **Line Splitting**: Split by `\r?\n` (handles both Unix and Windows line endings)
3. **Empty Line Skipping**: Skip leading empty lines
4. **Separator Preamble Detection**: MoneyWiz exports may start with `sep=,` — extract delimiter and skip this line
5. **Empty Line Filtering**: Remove all empty lines from content

**Separator Preamble Example:**

```csv
sep=,
"Name","Current balance","Account",...
```

### 1.2 CSV Structure

MoneyWiz exports use these column headers (in order):

| Column          | CSV Key       | Description                        |
| --------------- | ------------- | ---------------------------------- |
| Name            | `Name`        | Account name (header rows only)    |
| Current balance | —             | Account balance (header rows only) |
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
| Balance         | —             | Running balance (not parsed)       |

### 1.3 Row Classification

Each CSV row is classified before parsing:

| Condition                                  | Classification      | Action                   |
| ------------------------------------------ | ------------------- | ------------------------ |
| `Name` filled AND `Current balance` filled | **Account Header**  | Skip (not a transaction) |
| `Name` empty (transaction row)             | **Transaction Row** | Parse as transaction     |

**Account Header Example:**

```csv
"Cash wallet [THB] (W)","1,380.00","THB","","","","","","","","","","","",""
```

These rows contain account balances and must be skipped.

### 1.4 Field Parsing

#### Date Parsing

- **Format**: `DD/MM/YYYY` with optional `HH:MM` time
- **Output**: JavaScript Date object
- **Empty Date**: Returns `new Date(0)` (epoch)

#### Amount Parsing

- **Format**: `1,234.56` or `-1,234.56`
- **Processing**: Strip commas, parse as float
- **NaN Handling**: Returns `0` for invalid values
- **Default Currency**: `THB` if not specified

#### Category Parsing

- **Format**: `Parent > Child` (hierarchical with `>` delimiter)
- **Output**: `{ category: string, subcategory: string }`
- **Single Level**: `{ category: "Food", subcategory: "" }`
- **Two Levels**: `{ category: "Food", subcategory: "Restaurants" }`

#### Account Parsing

- **Format**: `<name> [<extra>] (<type>)`
- **Components**:
  - `name`: Account display name (required)
  - `extra`: Optional metadata in square brackets (e.g., card last 4 digits)
  - `type`: Account type code in parentheses

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
| —    | Unknown        |

**Examples:**

- `My Savings (A)` → `{ name: "My Savings", type: "Checking", extra: null }`
- `Chase [1234] (C)` → `{ name: "Chase", type: "CreditCard", extra: "1234" }`
- `Coinbase (CT)` → `{ name: "Coinbase", type: "Cryptocurrency", extra: null }`

#### Tag Parsing

- **Format**: `category: name; category2: name2` (semicolon-separated, colon-delimited)
- **Output**: `Array<{ category: string, name: string }>`
- **Special Mapping**: `Zvent` → `Event` (legacy tag normalization)
- **No Category**: `{ category: "", name: "tag" }`

### 1.5 Transaction Classification

Transactions are classified based on field values in this priority order:

| Priority | Condition                                     | Type                            | Fields Present                  |
| -------- | --------------------------------------------- | ------------------------------- | ------------------------------- |
| 1        | Category = `Payment > Debt`                   | `Debt`                          | payee, category, checkNumber    |
| 2        | Category = `Payment > Debt Repayment`         | `DebtRepayment`                 | payee, category, checkNumber    |
| 3        | Category = `Payment > Windfall`               | `Windfall`                      | payee, category, checkNumber    |
| 4        | Category = `Payment > Giveaways`              | `Giveaway`                      | payee, category, checkNumber    |
| 5        | `Transfers` filled AND `Category` filled      | `Income` / `Expense` / `Refund` | payee (from Transfer), category |
| 6        | `Transfers` filled AND `Category` empty       | `Transfer`                      | transfer                        |
| 7        | `Amount > 0` AND category matches income list | `Income`                        | payee, category, checkNumber    |
| 8        | `Amount < 0`                                  | `Expense`                       | payee, category, checkNumber    |
| 9        | `Amount > 0` AND NOT income category          | `Refund`                        | payee, category, checkNumber    |

**Special Category Transaction Types (Priority 1-4):**

These categories are classified BEFORE any other logic and are tracked separately from normal income/expense:

| Category                   | Type            | Description             |
| -------------------------- | --------------- | ----------------------- |
| `Payment > Debt`           | `Debt`          | Money lent to others    |
| `Payment > Debt Repayment` | `DebtRepayment` | Money repaid to you     |
| `Payment > Windfall`       | `Windfall`      | Unexpected income/gifts |
| `Payment > Giveaways`      | `Giveaway`      | Money given as gifts    |

**Income Category Detection (Category Name Prefix):**

Transactions are classified as income when their **category name** (the parent category, not subcategory) matches one of these prefixes:

| Category Prefix | Description           |
| --------------- | --------------------- |
| `Compensation`  | Employment/investment |
| `Other Incomes` | Other income sources  |

Any transaction with `Amount > 0` AND a category starting with `Compensation` or `Other Incomes` is classified as `Income`.

**Transaction Type Summary:**

- **Debt**: Money lent to others (Payment > Debt category, tracked separately)
- **DebtRepayment**: Money repaid by others (Payment > Debt Repayment category, tracked separately)
- **Windfall**: Unexpected income or gifts received (Payment > Windfall category, tracked separately)
- **Giveaway**: Money given as gifts (Payment > Giveaways category, tracked separately)
- **Transfer**: Moving money between accounts without category (excluded from analysis)
- **Income**: Money received (positive amount with income category, or transfer with income category)
- **Expense**: Money spent (negative amount, or transfer with category and negative amount)
- **Refund**: Money returned (positive amount with non-income category)

## 2. Filter Chain (Applied in Order)

1. Date Filter (from/to month range)
2. Tag Filter (per category: include OR exclude selected values)
3. Category Filter (include OR exclude selected categories)
4. Transfer Exclusion (see below)
5. Special Category Exclusion (Debt/Gifts moved to separate sections)
6. Analyzed Transactions

### Tag Filter Logic

- Multiple tag categories operate with **AND** logic (all must match)
- Within a category, selected values operate with **OR** logic (any match)
- Mode per category: `include` = must have tag, `exclude` = must NOT have tag

### Category Filter Logic

- `include` mode: only transactions matching selected categories
- `exclude` mode: all transactions EXCEPT selected categories

## 3. Special Category Handling

These categories are **excluded from main totals** but tracked separately:

| Category                   | Section          | Logic                        |
| -------------------------- | ---------------- | ---------------------------- |
| `Payment > Debt`           | Debt Tracking    | Amount = money lent out      |
| `Payment > Debt Repayment` | Debt Tracking    | Amount = money repaid to you |
| `Payment > Giveaways`      | Gifts & Windfall | Amount = gifts given         |
| `Payment > Windfall`       | Gifts & Windfall | Amount = gifts received      |

**Debt Balance:** `Lent − Repaid` (positive = they owe you)
**Gift Balance:** `Received − Given` (positive = net gain)

## 4. Category Tree Structure

Categories are split by `>` and grouped hierarchically. Parent categories contain child subcategories.

- Percentages at parent level = share of total expenses
- Percentages at child level = share of parent total
- Refunds reduce both parent and child totals
