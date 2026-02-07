# MoneyWiz CSV Analyzer — Logic Summary

- [1. Data Parsing](#1-data-parsing)
  - [Account Naming Convention](#account-naming-convention)
- [2. Filter Chain (Applied in Order)](#2-filter-chain-applied-in-order)
  - [Tag Filter Logic](#tag-filter-logic)
  - [Category Filter Logic](#category-filter-logic)
- [3. Transaction Classification](#3-transaction-classification)
- [4. Special Category Handling](#4-special-category-handling)
- [5. Calculations](#5-calculations)
- [6. Category Tree Structure](#6-category-tree-structure)
- [7. Monthly Chart](#7-monthly-chart)

## 1. Data Parsing

| Field    | Format                             | Notes                                |
| -------- | ---------------------------------- | ------------------------------------ |
| Date     | `DD/MM/YYYY`                       | Parsed to JS Date object             |
| Amount   | `1,234.56`                         | Commas stripped, parsed as float     |
| Tags     | `category: name; category2: name2` | Semicolon-separated, colon-delimited |
| Category | `Parent > Child`                   | Hierarchical with `>` delimiter      |
| Account  | `<name> [<extra>] (<type>)`        | See Account Naming Convention below  |

### Account Naming Convention

Account names follow the pattern: `<name> [<extra>] (<type>)`

- **name**: Account display name (required)
- **extra**: Optional metadata in square brackets (e.g., card last 4 digits)
- **type**: Account type code in parentheses

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

**Examples:**

- `My Savings (A)` → Checking account named "My Savings"
- `Chase [1234] (C)` → Credit card with extra "1234"
- `Coinbase (CT)` → Cryptocurrency account

---

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

---

## 3. Transaction Classification

| Condition                                                        | Classification                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| `Transfers` field populated AND no `Category`                    | **Pure Transfer** — excluded from analysis                |
| `Transfers` field populated AND has `Category`                   | **Categorized Transfer** — treated as real expense/income |
| `Amount > 0` AND category starts with `Compensation` or `Income` | **Income**                                                |
| `Amount < 0` AND NOT income category                             | **Expense**                                               |
| `Amount > 0` AND NOT income category                             | **Refund** — reduces expense totals                       |

---

## 4. Special Category Handling

These categories are **excluded from main totals** but tracked separately:

| Category                   | Section          | Logic                        |
| -------------------------- | ---------------- | ---------------------------- |
| `Payment > Debt`           | Debt Tracking    | Amount = money lent out      |
| `Payment > Debt Repayment` | Debt Tracking    | Amount = money repaid to you |
| `Payment > Giveaways`      | Gifts & Windfall | Amount = gifts given         |
| `Payment > Windfall`       | Gifts & Windfall | Amount = gifts received      |

**Debt Balance:** `Lent − Repaid` (positive = they owe you)
**Gift Balance:** `Received − Given` (positive = net gain)

---

## 5. Calculations

| Metric             | Formula                                |
| ------------------ | -------------------------------------- |
| **Gross Expenses** | `sum(abs(expense amounts))`            |
| **Total Refunds**  | `sum(refund amounts)`                  |
| **Net Expenses**   | `Gross Expenses − Total Refunds`       |
| **Net Cash Flow**  | `Total Income − Net Expenses`          |
| **Savings Rate**   | `(Net Cash Flow / Total Income) × 100` |

---

## 6. Category Tree Structure

Categories are split by `>` and grouped hierarchically:

```
Food & Dining (parent)
  ├── Restaurants (child) — 45%
  ├── Groceries (child) — 35%
  └── Coffee (child) — 20%
```

- Percentages at parent level = share of total expenses
- Percentages at child level = share of parent total
- Refunds reduce both parent and child totals

---

## 7. Monthly Chart

Aggregates by `YYYY-MM` key:

- **Income:** sum of income transactions
- **Expenses:** `Gross − Refunds` for that month
- **Remaining:** `Income − Expenses`
