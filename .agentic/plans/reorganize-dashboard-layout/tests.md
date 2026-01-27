# Tests: reorganize-dashboard-layout

Test plan for validating the implementation.

## Unit Tests

- [ ] `analytics.ts`: `calculateIncomeExpenseTimeSeries` correctly groups by day for short ranges
- [ ] `analytics.ts`: `calculateIncomeExpenseTimeSeries` correctly groups by month for long ranges (> 2 months)
- [ ] `IncomeByCategory`: Renders only Income categories
- [ ] `ExpenseByCategory`: Renders only Expense categories
- [ ] `IncomeExpenseBarChart`: Correctly maps data to chart dataset structure

## Integration Tests

- [ ] `+page.svelte`: Changing the global date filter updates all new components
- [ ] `IncomeExpenseBarChart`: Reacts to data updates triggers re-render

## E2E Tests

- [ ] Dashboard displays all new sections (IncomeByCategory, ExpenseByCategory, BarChart)
- [ ] Layout follows the 3-row structure on desktop
- [ ] Charts are visible and interactive

## Manual Testing

0. Load the application with `wrong-report.csv` and `report.csv` to verify error handling and valid data.
1. Select a date range of 1 week -> Verify Bar Chart is in "Daily" mode.
2. Select a date range of 1 year -> Verify Bar Chart is in "Monthly" mode.
3. Hover over the Bar Chart bars -> Verify tooltips show correct Income, Expense, and Net values.
4. Resize window to mobile width -> Verify components stack vertically in the correct order (Income Cat -> Expense Cat -> ...).

## Edge Cases

- [ ] Empty dataset (no CSV loaded) -> Components show "No data" or empty state
- [ ] Date range with 0 transactions -> Charts handle empty arrays gracefully
- [ ] Date range exactly on the boundary of 2 months -> Verify behavior is consistent

## Test Commands

```bash
# Run unit tests
bun run test:unit
```

```bash
# Run e2e tests
bun run test:e2e
```
