# Spec Delta: Refine UI Dashboard and Header

## Specification: ui

## ADDED Requirements

### Requirement: Dashboard Cleanliness
The dashboard SHALL maintain a clean landing state when no data is provided.

#### Scenario: Hide title when dashboard is empty
- **Given** the user has not uploaded a CSV file
- **Then** the "Dashboard" heading SHOULD NOT be visible
- **And** an onboarding message SHOULD be displayed instead

### Requirement: External Links
The application SHALL provide access to its source code to facilitate developer engagement.

#### Scenario: GitHub link in header
- **Given** the application header is rendered
- **Then** it SHOULD include a link to the GitHub repository at the far right
- **And** the link MUST use the official GitHub icon
- **And** the link MUST open in a new tab

### Requirement: Document Layout Hierarchy
The application SHALL prioritize data visualizations over raw data previews.

#### Scenario: Visualizations above raw data
- **Given** a CSV file is successfully uploaded
- **Then** the Dashboard (charts and summaries) MUST be rendered above the CSV Preview table
- **And** the CSV Preview table MUST be collapsable to save vertical space
- **And** the CSV Preview table SHOULD be collapsed by default
