# Spec: biz-preview-tab

## Purpose

Defines the requirements for the Preview tab in the MoneyWiz dashboard, providing users with a dedicated view for inspecting raw transaction data from uploaded CSV files.

## Requirements

### Requirement: Preview Tab Display

The Preview tab SHALL display the raw CSV data in a readable table format.

#### Scenario: Data table presentation

- **Given** the user is on the Preview tab with data loaded
- **Then** a table MUST be displayed showing the CSV data
- **And** all column headers from the CSV MUST be visible
- **And** the table MUST have rounded corners (`rounded-xl`)
- **And** the table MUST support horizontal scrolling when content exceeds viewport width
- **And** column headers MUST NOT wrap (use `whitespace-nowrap`)

### Requirement: Row Preview Limit

The Preview tab SHALL allow users to configure the number of visible rows to balance performance and inspection needs.

#### Scenario: Controllable row display

- **Given** the user is viewing the Preview tab
- **Then** a dropdown MUST be visible to select the number of rows
- **And** the options MUST include: 5, 10, 20, 50, 100
- **And** the default selection MUST be 5 rows

#### Scenario: Limited row display

- **Given** the CSV file contains more rows than the selected limit
- **Then** only the selected number of rows MUST be displayed in the table
- **And** a message MUST indicate "Showing first X rows of N" where X is the selected limit and N is the total count

#### Scenario: Small dataset display

- **Given** the CSV file contains fewer rows than the selected limit
- **Then** all rows MUST be displayed
- **And** no row count message is needed

### Requirement: Filter Integration

The Preview tab SHALL respect the active global data filters.

#### Scenario: Filtering preview data

- **Given** filters (date, tags, or currency) are applied in the dashboard
- **Then** the rows displayed in the Preview tab MUST match the filtered dataset
- **And** the "Showing first X rows of N" message MUST reflect the count of rows matching the filters

### Requirement: Empty State Handling

The Preview tab SHALL gracefully handle CSV files with no data rows.

#### Scenario: No data rows

- **Given** the CSV file has headers but no data rows
- **Then** a warning message MUST be displayed: "No data rows found in this file."
- **And** the message MUST have an amber/warning visual style

### Requirement: Tab Access

The Preview tab SHALL be accessible only when data is loaded.

#### Scenario: Tab visibility

- **Given** a CSV file is successfully uploaded
- **Then** the Preview tab MUST be visible in the tab navigation
- **And** clicking it MUST switch to the Preview view
- **And** the Overview tab MUST remain the default selected tab

## Constraints

- Preview tab is only visible when CSV data is loaded
- Default of 5 rows displayed in preview, user adjustable up to 100
- Table must be horizontally scrollable for wide content
- Preview data must reflect active filters

## Examples

## Notes

The Preview tab provides a read-only view of the raw data. Data manipulation features (search, sort, pagination, filtering) are out of scope for this spec.
