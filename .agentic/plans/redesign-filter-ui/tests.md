# Tests: redesign-filter-ui

## Unit Tests
-   `DateFilter.svelte`: Check that presets emit correct dates.
-   `TagCategoryFilter.svelte`: Check that clicking options updates the bound filter value.
-   `TagCategoryFilter.svelte`: Check toggle switches mode between 'include' and 'exclude'.

## Integration Tests
-   `FilterBar` correctly renders child filters based on `rows` prop.

## E2E Tests
-   **Date Filtering**: Open Dashboard, click Date Filter, select "Last Month", verify data filtered.
-   **Tag Filtering**: Click a Tag Filter (e.g. "Category"), toggle "Exclude", select a value, verify rows matching that value are hidden.

## Manual Tests
-   Test with dataset having many tag categories to see layout behavior.
-   Test clearing all filters.
