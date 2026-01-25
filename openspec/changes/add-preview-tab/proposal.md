# Change: Add Data Preview Tab with Configurable Row Display

## Why
Currently, the data preview table is displayed at the bottom of the page layout, outside the dashboard's tabbed interface. This creates a disconnected user experience where the preview is always visible and lacks granular control over the number of rows displayed. Users need a dedicated space to inspect their raw CSV data with flexible pagination options.

## What Changes
- Move DataPreviewPanel from layout-level rendering to a new "Preview" tab within the dashboard
- Add row count selector with options: 5, 10, 20, 50, 100 rows
- Update tab navigation to include "Overview" and "Preview" tabs
- Enhance DataPreviewPanel component to accept configurable row limits
- Update UI to show selected row count and total row count

## Impact
- **Affected specs**: `ui-design`, `overview-tab-design`
- **Affected code**:
  - `src/routes/+layout.svelte` - Remove DataPreviewPanel from bottom
  - `src/routes/+page.svelte` - Add Preview tab with DataPreviewPanel
  - `src/components/organisms/DataPreviewPanel.svelte` - Add maxRows prop and row selector UI
  - Tests: Update component and E2E tests for new tab navigation and row selection
