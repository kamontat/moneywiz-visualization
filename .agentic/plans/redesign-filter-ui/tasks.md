# Tasks: redesign-filter-ui

## Steps

-   title: Create DateFilterContent Component
    description: Create `src/components/molecules/filters/DateFilterContent.svelte`. This contains the inputs and presets for date filtering.
    files: [src/components/molecules/filters/DateFilterContent.svelte]
    changes: Extract date logic and presets from FilterPanel. This is the *content* of the date panel.

-   title: Create TagCategoryContent Component
    description: Create `src/components/molecules/filters/TagCategoryContent.svelte`. This contains the checkbox list and toggles for a single category.
    files: [src/components/molecules/filters/TagCategoryContent.svelte]
    changes: Accepts category name, values, and current TagFilter state. Implements the list of checkboxes/buttons and the Include/Exclude toggle.

-   title: Create FilterBar Component
    description: Create `src/components/organisms/FilterBar.svelte`. This manages the row of buttons and the expandable panel area.
    files: [src/components/organisms/FilterBar.svelte]
    changes:
        -   Render row of buttons (Date, Cat 1, Cat 2...).
        -   Manage `activeFilter` state (which filter is open).
        -   Render the "Expansion Area" below the buttons.
        -   Conditionally render `DateFilterContent` or `TagCategoryContent` inside the expansion area.

-   title: Integrate FilterBar into Dashboard
    description: Replace the usage of `FilterPanel` in `Dashboard.svelte` with `FilterBar`.
    files: [src/components/organisms/Dashboard.svelte]
    changes: Swap components, ensure props are passed correctly.

-   title: Remove Old FilterPanel
    description: Delete the obsolete `FilterPanel.svelte`.
    files: [src/components/organisms/FilterPanel.svelte]
    changes: Delete file.

## Verification
-   [ ] Verify clicking "Date" expands the panel with date controls.
-   [ ] Verify clicking a Category expands the panel with category controls.
-   [ ] Verify clicking the active button again (or a close button) collapses the panel.
-   [ ] Verify Include/Exclude toggle updates the logic correctly.
