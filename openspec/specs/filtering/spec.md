# filtering Specification

## Purpose
Defines requirements for date-based filtering of financial transactions in the MoneyWiz Visualization dashboard, enabling users to focus on specific time periods for analysis.
## Requirements
### Requirement: [REQ-FIL-001] Date Range Selection
The system MUST allow users to filter transactions by a specific start and end date.
#### Scenario: Filtering by Start Date
- **Given** a set of transactions from various dates
- **When** a start date of `2024-01-01` is applied
- **Then** only transactions on or after `2024-01-01` are displayed
#### Scenario: Filtering by Range
- **Given** transactions on `2023-12-31`, `2024-01-15`, and `2024-02-01`
- **When** a range of `2024-01-01` to `2024-01-31` is applied
- **Then** only the transaction on `2024-01-15` is displayed

### Requirement: [REQ-FIL-002] Quick Filter Presets
The system SHALL provide presets for common time intervals to improve efficiency.
#### Scenario: "This Month" Preset
- **Given** today is 2024-03-15
- **When** "This Month" is clicked
- **Then** the filter range is set from `2024-03-01` to `2024-03-15`
#### Scenario: "Last 30 Days" Preset
- **Given** today is 2024-03-15
- **When** "Last 30 Days" is clicked
- **Then** the filter range is set from `2024-02-14` to `2024-03-15`

### Requirement: [REQ-FIL-003] Collapsible Filter Interface
The filtering interface SHALL be collapsible to maximize space for data visualization.
#### Scenario: Toggling Filter Visibility
- **When** the "Filter" button is clicked
- **Then** the filter form expands/collapses
- **And** the current filter status remains visible even when collapsed

### Requirement: [REQ-FIL-004] Tag Parsing from CSV
The system MUST parse tags from the CSV "Tags" column, supporting the format `<category>: <value>` with multiple entries separated by semicolons.

#### Scenario: Single tag entry
- **GIVEN** a CSV row with Tags field `"Group: KcNt; "`
- **WHEN** the data is parsed
- **THEN** the system extracts one tag with category "Group" and value "KcNt"

#### Scenario: Multiple tag entries
- **GIVEN** a CSV row with Tags field `"Group: KcNt; Type: Personal; "`
- **WHEN** the data is parsed
- **THEN** the system extracts two tags: {"Group": "KcNt"} and {"Type": "Personal"}

#### Scenario: Empty or missing tags
- **GIVEN** a CSV row with Tags field `""`
- **WHEN** the data is parsed
- **THEN** no tags are extracted for that row

#### Scenario: Unique tag categories and values
- **GIVEN** CSV data with various tag entries
- **WHEN** all rows are processed
- **THEN** the system produces a map of unique categories to their unique values (e.g., `{"Group": ["KcNt", "Other"], "Type": ["Personal", "Work"]}`)

### Requirement: [REQ-FIL-005] Tag-Based Filtering with Include/Exclude Modes
The system MUST allow users to filter transactions by tags, supporting multiple selections per category with include or exclude modes.

#### Scenario: Include mode with single tag
- **GIVEN** transactions with tags "Group: KcNt" and "Group: Other"
- **WHEN** user selects "Include" mode for category "Group" with value "KcNt"
- **THEN** only transactions containing "Group: KcNt" are displayed

#### Scenario: Include mode with multiple tags in same category
- **GIVEN** transactions with tags "Group: KcNt", "Group: Other", and "Group: Work"
- **WHEN** user selects "Include" mode for category "Group" with values ["KcNt", "Other"]
- **THEN** only transactions containing either "Group: KcNt" OR "Group: Other" are displayed

#### Scenario: Exclude mode with single tag
- **GIVEN** transactions with tags "Group: KcNt" and "Group: Other"
- **WHEN** user selects "Exclude" mode for category "Group" with value "KcNt"
- **THEN** transactions containing "Group: KcNt" are hidden; only "Group: Other" transactions are shown

#### Scenario: Exclude mode with multiple tags
- **GIVEN** transactions with tags "Group: KcNt", "Group: Other", and "Group: Work"
- **WHEN** user selects "Exclude" mode for category "Group" with values ["KcNt", "Work"]
- **THEN** only transactions that do NOT contain "Group: KcNt" or "Group: Work" are displayed (i.e., "Group: Other" transactions)

#### Scenario: Multi-category filtering
- **GIVEN** transactions with various combinations of "Group" and "Type" tags
- **WHEN** user applies Include filter for "Group: KcNt" AND Exclude filter for "Type: Work"
- **THEN** only transactions with "Group: KcNt" that do NOT have "Type: Work" are displayed
- **AND** filters from different categories combine using AND logic

#### Scenario: No tags selected for a category
- **GIVEN** available tag categories
- **WHEN** user does not select any tags for a category
- **THEN** that category does not filter results (all values pass through)

### Requirement: [REQ-FIL-006] Tag Filter Persistence
The system SHALL persist tag filter selections in localStorage so that user preferences survive page reloads.

#### Scenario: Tag filters persist on reload
- **GIVEN** user has selected tag filters (e.g., Include "Group: KcNt")
- **WHEN** the page is reloaded
- **THEN** the same tag filters are automatically reapplied
- **AND** the dashboard displays filtered data immediately

#### Scenario: Clearing tag filters
- **GIVEN** user has active tag filters
- **WHEN** user clicks "Clear Filter" or clears all tag selections
- **THEN** tag filter state is removed from localStorage
- **AND** all transactions (subject to date filters only) are displayed

#### Scenario: Tag filter UI state restoration
- **GIVEN** user has persisted tag filters in localStorage
- **WHEN** the page loads
- **THEN** the FilterPanel UI reflects the saved selections (category modes, selected values)
- **AND** the filter displays as "Active" if any tag filters are applied

