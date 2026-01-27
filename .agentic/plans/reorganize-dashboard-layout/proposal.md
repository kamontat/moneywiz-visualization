# Proposal: reorganize-dashboard-layout

## Objective

Reorganize dashboard layout to prioritize category breakdowns and enhance income vs expense visualization with a new adaptive bar chart.

## Description

The current dashboard places visualizations in a suboptimal order and lacks a clear comparison between income and expenses over time. This plan involves splitting the combined category breakdown into distinct income and expense components, introducing a dual-axis bar/line chart that adapts to the selected date range (daily vs monthly), and restructuring the dashboard grid into a three-row layout that establishes a logical hierarchy for financial analysis.

## Acceptance Criteria

- [ ] Split `CategoryBreakdown` into `IncomeByCategory` and `ExpenseByCategory` components
- [ ] Create `IncomeExpenseBarChart` showing income (bar), expense (bar), and delta (line)
- [ ] Implement adaptive Daily/Monthly aggregation logic in `IncomeExpenseBarChart` (> 2 months triggers monthly)
- [ ] Update Dashboard Row 1: Income By Category (left) | Expense By Category (right)
- [ ] Update Dashboard Row 2: Income vs Expense Pie (left) | Income vs Expense Bar (right)
- [ ] Update Dashboard Row 3: Top Categories (full width)
- [ ] Verify responsive behavior to ensure layout stack correctly on mobile

## Out of Scope

- Changes to the "Trends" tab or other pages
- Backend API changes (client-side processing only)
- Export functionality for new charts

## References

- [Original Proposal](https://raw.githubusercontent.com/kamontat/moneywiz-visualization/refs/heads/main/openspec/changes/reorganize-dashboard-layout/proposal.md)
