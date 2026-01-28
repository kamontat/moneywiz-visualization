# Tests: redesign-filter-ui

## Unit Tests
-   `DateFilterContent.svelte`: Check that presets emit correct dates.
-   `TagCategoryContent.svelte`: Check that clicking options updates the bound filter value.
-   `TagCategoryContent.svelte`: Check toggle switches mode between 'include' and 'exclude'.

## Integration Tests
-   `FilterBar` correctly renders triggers for all categories found in `rows`.
-   `FilterBar` only shows one content panel at a time.

## E2E Tests
-   **Date Filtering**: Open Dashboard, click "Date" button (panel expands), select "Last Month", verify data filtered.
-   **Tag Filtering**: Click a Tag button (panel expands), toggle "Exclude", select a value, verify rows matching that value are hidden.

## Manual Tests
-   Test with dataset having many tag categories to see layout behavior.
-   Test expanding/collapsing interaction smoothness.
