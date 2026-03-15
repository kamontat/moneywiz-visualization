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

---

This document defines SQL for monthly net worth with these requirements:

1. Ignore current month (incomplete month)
2. Output `start_balance`, `changed`, `end_balance`
3. Provide two statements:
   - Total net worth
   - Specific account

Investment behavior:

- Buy/Sell in investment accounts is cash <-> asset conversion, not direct
  net worth gain/loss.
- Investment balance should come from
  `ZINVESTMENTACCOUNTTOTALVALUE` (`cash + holdings`), not Buy/Sell sums.
