# Tasks: reorganize-dashboard-layout

Technical implementation steps for the proposal.

## Prerequisites

- [ ] Verify `analytics.ts` has existing helpers for grouping data
- [ ] Ensure Chart.js or existing charting library supports mixed bar/line types

## Implementation Steps

### Step 0: Implement Analytics Logic

Add time-series aggregation logic to support the new bar chart. Needs to handle switching between daily and monthly grouping based on total duration.

**Files to modify:**
- src/lib/analytics.ts
- src/lib/analytics.spec.ts

**Changes:**
- Add `calculateIncomeExpenseTimeSeries(data, startDate, endDate)` function
- Add unit tests for daily vs monthly aggregation

### Step 1: Create Split Category Components

Refactor the existing `CategoryBreakdown` into two specialized components.

**Files to modify:**
- src/components/organisms/IncomeByCategory.svelte
- src/components/organisms/ExpenseByCategory.svelte
- src/components/organisms/CategoryBreakdown.svelte (reference/delete)

**Changes:**
- Create `IncomeByCategory.svelte` filtering only income types
- Create `ExpenseByCategory.svelte` filtering only expense types
- Ensure both maintain the existing styling consistency

### Step 2: Create IncomeExpenseBarChart Component

Build the new dual-axis chart for visualizing trends.

**Files to modify:**
- src/components/organisms/IncomeExpenseBarChart.svelte
- src/components/organisms/IncomeExpenseBarChart.svelte.spec.ts

**Changes:**
- Implement Chart.js mixed chart (Bars for Income/Expense, Line for Net)
- detailed tooltip implementation
- Add logic to switch scale based on date range duration

### Step 3: Update Dashboard Layout

Reorganize the main page grid to match the new design requirements.

**Files to modify:**
- src/routes/+page.svelte

**Changes:**
- Update CSS Grid/Flex layout
- Replace `CategoryBreakdown` instances with new components
- Insert `IncomeExpenseBarChart` in the second row
- Reorder components to: Row 1 (Split Categories), Row 2 (Pies + Bar), Row 3 (Top Categories)

## Verification

- [ ] Verify Dashboard loads without errors
- [ ] Check date range picker updates the Bar Chart (Daily <-> Monthly mode)
- [ ] Verify Income/Expense split components show correct totals matching the original combined component
- [ ] Check mobile responsiveness (stacking order)
