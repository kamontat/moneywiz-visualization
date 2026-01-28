# Spec: Filter UI

## Purpose

Define the specialized UI/UX for the dashboard filtering system, moving away from a generic panel to specific controls.

## Requirements

- The Filter Bar must be horizontal and support scrolling on small screens.
- Each filter type (Date, Tag Categories) must have a dedicated trigger button.
- Clicking a trigger button expands a specific panel section below the bar (Accordion style).
- Only one filter panel section can be active/open at a time.
- **Date Filter**: Must provide start/end date inputs and quick presets (e.g., This Month, Last 30 Days).
- **Tag Category Buttons**: Created dynamically based on available tags in the dataset.
- **Tag Filter Content**: Must allow selecting multiple values and toggling between "Include" and "Exclude" mode.
- **Visual Feedback**: Active filters must show an indicator (e.g., dot or count).
- **Clear Actions**: Must support clearing individual category filters and a global "Clear All".

## Constraints

- Must work well on mobile devices (touch targets, screen width).
- Must handle dynamic tag categories that may change with data uploads.

## Examples

N/A

## Notes

Replaces the previous monolithic `FilterPanel` component.
