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

The Preview tab SHALL limit the number of visible rows to maintain performance and clarity.

#### Scenario: Limited row display

- **Given** the CSV file contains more than 5 rows
- **Then** only the first 5 rows MUST be displayed in the table
- **And** a message MUST indicate "Showing first 5 rows of N" where N is the total count

#### Scenario: Small dataset display

- **Given** the CSV file contains 5 or fewer rows
- **Then** all rows MUST be displayed
- **And** no row count message is needed

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
- Maximum 5 rows displayed in preview
- Table must be horizontally scrollable for wide content
- Must not affect filter state when switching tabs

## Examples

## Notes

The Preview tab provides a read-only view of the raw data. Data manipulation features (search, sort, pagination, filtering) are out of scope for this spec.
