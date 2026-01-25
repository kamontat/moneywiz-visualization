# Proposal: Collapsible Date Filter

## Why
Currently, the MoneyWiz Visualization dashboard displays all data from the uploaded CSV export. There is no way for users to focus on a specific time period (e.g., current month, last 30 days), which makes periodic financial analysis difficult.

## What Changes
Implement a collapsible filter panel at the top of the dashboard that allows users to filter transactions by date range. The panel will include manual date inputs and convenient "quick filter" buttons for common time periods.

## User Experience
- A "Filter" section sits above the dashboard summary.
- The section is collapsible to save vertical space.
- Users can manually select start and end dates.
- Users can click quick buttons (This Month, Last 30 Days, This Year, All Time) to instantly update the range.
- All charts and summaries update reactively to show data only within the selected range.
- The filter state is preserved in the local component state (or optionally `localStorage` for persistence).

## Implementation Plan
1.  **Analytics Enhancement**: Add `filterByDateRange` to `$lib/analytics.ts`.
2.  **Filter Panel Component**: Create `FilterPanel.svelte` in `src/components/organisms/`.
3.  **Dashboard Integration**: Update `src/routes/+page.svelte` to include the filter panel and use derived filtered rows for all visualizations.
4.  **Testing**: Add unit tests for filtering logic and E2E tests for the filter panel interaction.

## Dependencies
- None beyond existing tech stack (Svelte 5, TailwindCSS).
