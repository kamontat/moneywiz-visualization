# Change: Reorganize Dashboard Layout with Enhanced Income vs Expense Visualization

## Why
The current dashboard layout places visualizations in a less optimal order for financial analysis. Users need a clearer view of category-level breakdowns first, followed by comparative income vs expense trends. The existing DailyExpensesChart only shows expenses in isolation, missing the critical income comparison that helps users understand their financial health over time.

Additionally, the CategoryBreakdown component combines both income and expense panels in a single component, which limits layout flexibility and prevents side-by-side comparison of income and expense categories.

## What Changes
- Split CategoryBreakdown component into two separate components: IncomeByCategory and ExpenseByCategory
- Create new IncomeExpenseBarChart component that displays income (positive bars), expenses (negative bars), and delta (income - expense) as a line chart
- Implement adaptive Daily/Monthly mode in IncomeExpenseBarChart based on date range (<2 months = daily mode, >=2 months = monthly mode)
- Reorganize Overview tab layout to prioritize category breakdowns:
  - **Row 1**: Income by Category | Expense by Category
  - **Row 2**: Income vs Expense (pie chart) | Daily/Monthly Income vs Expense (bar chart)
  - **Row 3**: Top Categories (full width)
- Add analytics functions to support the new bar chart data aggregation

## Impact
- **Affected specs**: `overview-tab-design`, `ui-design`
- **Affected code**:
  - `src/components/organisms/CategoryBreakdown.svelte` → Split into two new components
  - `src/components/organisms/IncomeByCategory.svelte` (NEW) - Income panel only
  - `src/components/organisms/ExpenseByCategory.svelte` (NEW) - Expense panel only
  - `src/components/organisms/IncomeExpenseBarChart.svelte` (NEW) - Dual bar + line chart
  - `src/lib/analytics.ts` - Add `calculateIncomeExpenseTimeSeries()` function
  - `src/routes/+page.svelte` - Update layout and wire new components
  - Tests: Update component tests and add E2E tests for new layout
