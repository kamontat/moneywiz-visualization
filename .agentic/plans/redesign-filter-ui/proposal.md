# Redesign Filter UI

## Objective
Redesign the filter interface into a compact, horizontal filter bar where each filter type (Date, Tag Categories) has its own trigger button. Clicking a button expands a specific panel for that filter below the bar, replacing the current monolithic "Filter" drawer and avoiding floating dropdowns.

## Description
The current "Filter" drawer is too large and aggregates everything. The new design introduces a **Filter Bar**: a horizontal row of buttons for each active filter type (Date, Project, Status, etc.).
-   **Interaction**: Clicking a button expands a dedicated panel section immediately below the bar (similar to the current drawer but scoped only to that filter).
-   **No Dropdowns**: To maintain the robustness of the "full panel design", we avoid small floating popovers.
-   **Compactness**: The panel only shows controls for the active filter, keeping the interface clean and small.
-   **Toggle Design**: The "Include/Exclude" selection mode will be upgraded to a clear toggle/segmented control.

## Criteria
-   [ ] Remove the single, large aggregate collapsible "Filter" panel.
-   [ ] Implement a horizontal Filter Bar with buttons for Date and each Tag Category.
-   [ ] Clicking a button expands a dedicated panel below the bar containing only that filter's controls.
-   [ ] "Date" panel contains date range inputs and presets.
-   [ ] "Tag Category" panels contain value selection and the new Include/Exclude toggle.
-   [ ] Ensure only one filter panel is expanded at a time (accordion-like behavior).

## Out of Scope
-   Changing the underlying filtering logic (AND/OR behavior).
-   Persisting filter state across reloads (unless already supported).

## References
N/A
