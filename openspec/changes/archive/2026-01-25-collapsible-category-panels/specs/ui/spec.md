# ui Specification Delta: Collapsible Category Panels

## ADDED Requirements

### Requirement: Collapsible Category Breakdown
The application SHALL provide a detailed breakdown of income and expenses by category in collapsible panels.

#### Scenario: Interactive Category Panels
- **Given** the dashboard is rendered with data
- **Then** two collapsible panels SHOULD be displayed: "Income by Category" and "Expense by Category"
- **And** the panels MUST have rounded corners (`rounded-xl`)
- **And** the entire header area of each panel MUST be clickable to toggle expansion
- **And** the Income panel header SHOULD use a semantic green background
- **And** the Expense panel header SHOULD use a semantic red background
- **And** when expanded, each panel MUST list categories with their total amount and percentage of the group total
- **And** expansion transitions SHOULD be smooth
