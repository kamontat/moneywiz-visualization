# Tasks: redesign-filter-ui

## Steps

-   title: Create DateFilter Component
    description: Create `src/components/molecules/filters/DateFilter.svelte`. This button + popover/dropdown handles start/end date inputs and quick presets.
    files: [src/components/molecules/filters/DateFilter.svelte]
    changes: Move date logic and presets from FilterPanel to here. Implementation as a standalone dropdown.

-   title: Create TagCategoryFilter Component
    description: Create `src/components/molecules/filters/TagCategoryFilter.svelte`. This handles filtering for a single tag category.
    files: [src/components/molecules/filters/TagCategoryFilter.svelte]
    changes: Accepts category name, values, and current TagFilter state. Implements the list of checkboxes/buttons and the Include/Exclude toggle.

-   title: Create FilterBar Component
    description: Create a new container component `src/components/organisms/FilterBar.svelte` to replace `FilterPanel`. It should orchestrate the state of individual filters.
    files: [src/components/organisms/FilterBar.svelte]
    changes: Scaffold component, accept same props as FilterPanel. Render the horizontal list of DateFilter and TagCategoryFilters.

-   title: Integrate FilterBar into Dashboard
    description: Replace the usage of `FilterPanel` in `Dashboard.svelte` with `FilterBar`.
    files: [src/components/organisms/Dashboard.svelte]
    changes: Swap components, ensure props are passed correctly.

-   title: Remove Old FilterPanel
    description: Delete the obsolete `FilterPanel.svelte`.
    files: [src/components/organisms/FilterPanel.svelte]
    changes: Delete file.

## Verification
-   [ ] Verify "Date" button opens date picker.
-   [ ] Verify presets work.
-   [ ] Verify each Tag Category appears as a button.
-   [ ] Verify Include/Exclude toggle updates the logic correctly.
-   [ ] Check responsiveness (does the bar wrap or scroll?).
