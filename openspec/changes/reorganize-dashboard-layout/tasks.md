## 1. Analytics Layer

- [ ] 1.1 Add `calculateIncomeExpenseTimeSeries()` function in `src/lib/analytics.ts` to aggregate income/expenses by day or month
- [ ] 1.2 Add unit tests for `calculateIncomeExpenseTimeSeries()` covering daily and monthly modes
- [ ] 1.3 Export new analytics types: `IncomeExpenseTimeSeries`, `TimeSeriesItem`, `TimeSeriesMode`

## 2. Component Refactoring

- [ ] 2.1 Create `src/components/organisms/IncomeByCategory.svelte` component (extract income panel from CategoryBreakdown)
- [ ] 2.2 Create `src/components/organisms/ExpenseByCategory.svelte` component (extract expense panel from CategoryBreakdown)
- [ ] 2.3 Write unit tests for IncomeByCategory component
- [ ] 2.4 Write unit tests for ExpenseByCategory component
- [ ] 2.5 Create `src/components/organisms/IncomeExpenseBarChart.svelte` with dual bars and line chart
- [ ] 2.6 Write unit tests for IncomeExpenseBarChart component, testing both daily and monthly modes

## 3. Page Layout Update

- [ ] 3.1 Update `src/routes/+page.svelte` to use the new 3-row layout structure
- [ ] 3.2 Calculate date range duration to determine daily vs monthly mode
- [ ] 3.3 Integrate `calculateIncomeExpenseTimeSeries()` into page derived state
- [ ] 3.4 Replace CategoryBreakdown with IncomeByCategory and ExpenseByCategory side-by-side
- [ ] 3.5 Add IncomeExpenseBarChart alongside IncomeExpenseRatioChart in Row 2
- [ ] 3.6 Move TopCategoriesChart to Row 3 with full width

## 4. Cleanup and Testing

- [ ] 4.1 Remove obsolete `src/components/organisms/CategoryBreakdown.svelte` and its test file
- [ ] 4.2 Remove obsolete `src/components/organisms/DailyExpensesChart.svelte` and its test file
- [ ] 4.3 Update unit tests for `src/routes/+page.svelte` to reflect new layout
- [ ] 4.4 Add E2E test for new dashboard layout verification
- [ ] 4.5 Add E2E test for daily/monthly mode switching based on date filter
- [ ] 4.6 Verify responsive behavior on mobile and desktop viewports

## 5. Documentation

- [ ] 5.1 Update component documentation with usage examples
- [ ] 5.2 Verify all accessibility attributes (ARIA labels, roles) are present
