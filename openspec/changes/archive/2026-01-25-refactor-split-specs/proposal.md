# Change: Refactor Spec Structure

## Why
The current `ui` specification has become monolithic, containing mixed concerns regarding CSV logic, general UI design, and specific dashboard components. Breaking it down into focused specifications (`csv-logic`, `ui-design`, `quick-summary-design`, `overview-tab-design`) will improve maintainability and discoverability of requirements.

## What Changes
- Splits `specs/ui/spec.md` into four separate specifications.
- **csv-logic**: Handles data persistence and CSV interaction logic.
- **ui-design**: Handles core UI elements, theming, header, and global layout.
- **quick-summary-design**: Handles the specific design of the quick summary section.
- **overview-tab-design**: Handles the layout and components of the Overview tab (breakdowns, charts).
- Deprecates the original `ui` capability in favor of these more granular ones.

## Impact
- Affected specs: `ui` (Removed/Migrated)
- No code changes required immediately, this is a documentation refactor to align with the domain model.
