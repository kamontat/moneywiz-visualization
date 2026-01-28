# Redesign Filter UI

## Objective
Redesign the filter interface into a compact, horizontal filter bar with separate dropdowns/popovers for date and each tag category to improve usability and spatial efficiency.

## Description
The current expanding "Filter" drawer is too large and aggregates all filters into one complex panel. This plan replaces it with a streamlined, horizontal "Filter Bar".
This bar will display distinct buttons for the Date Range and for each Tag Category (e.g., "Project", "Status") discovered in the data.
Clicking a filter button will open a focused popover for that specific filter.
Additionally, the "Include/Exclude" selection mode within tag filters will be updated from simple buttons to a more intuitive toggle or segmented control UI.

## Criteria
-   [ ] Remove the single, large collapsible "Filter" panel (drawer).
-   [ ] Implement a horizontal Filter Bar containing individual buttons for active filters.
-   [ ] Dedicated "Date" filter button that opens a date picker popover.
-   [ ] Dynamic filter buttons for each Tag Category (e.g. "Payment Method", "Bank") found in the dataset.
-   [ ] Each Tag Category button opens a dedicated popover to select values and set mode.
-   [ ] "Include/Exclude" controls redesign to be a proper toggle/segmented control.
-   [ ] The new design must be compact and efficient.

## Out of Scope
-   Changing the underlying filtering logic (AND/OR behavior).
-   Persisting filter state across reloads (unless already supported).

## References
N/A
