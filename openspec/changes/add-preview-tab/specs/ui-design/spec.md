## ADDED Requirements

### Requirement: Data Preview Tab
The dashboard SHALL provide a dedicated "Preview" tab for inspecting raw CSV data with configurable row display options.

#### Scenario: Tab navigation includes Preview tab
- **Given** a CSV file is successfully uploaded
- **Then** the tab navigation MUST include a "Preview" tab alongside the "Overview" tab
- **And** clicking the "Preview" tab MUST display the data preview table
- **And** the active tab MUST be visually distinguished with border and color highlighting

#### Scenario: Configurable row display
- **Given** the Preview tab is active and data is loaded
- **Then** a row count selector MUST be displayed above the preview table
- **And** the selector MUST offer options: 5, 10, 20, 50, 100 rows
- **And** the default selection SHOULD be 10 rows
- **And** changing the selection MUST update the displayed rows immediately
- **And** the footer text MUST show "Showing X of Y rows" where X is the selected count and Y is the total row count

#### Scenario: Preview isolated from Overview
- **Given** the user switches between tabs
- **Then** the data preview table MUST NOT be visible in the Overview tab
- **And** the data preview table MUST ONLY be visible when the Preview tab is active

## MODIFIED Requirements

### Requirement: Interactive Data Preview Panel
The application SHALL utilize a dedicated component for the data preview table that supports configurable row limits and aligns with the dashboard's interactive patterns.

#### Scenario: Consistent Interactive Header
- **Given** the data preview panel is visible in the Preview tab
- **Then** the panel header MUST have rounded corners (`rounded-xl` when collapsed)
- **And** the entire header area MUST be clickable to toggle expansion
- **And** the background color SHOULD be neutral (`gray-50` family) to differentiate from income/expense panels
- **And** the panel state SHOULD default to collapsed

#### Scenario: Configurable row limit
- **Given** the data preview panel is expanded
- **Then** it MUST accept a `maxRows` prop to control the number of displayed rows
- **And** the row count selector MUST allow users to choose from predefined options
- **And** the displayed rows MUST update immediately when the selection changes
