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

