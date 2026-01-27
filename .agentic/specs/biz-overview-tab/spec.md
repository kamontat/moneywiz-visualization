# Spec: biz-overview-tab

## Purpose

Defines the layout and component requirements for the Overview tab in the MoneyWiz dashboard, including category breakdowns, navigation controls, and financial data presentation.

## Requirements

### Requirement: Overview Tab Grid Layout

The Overview tab SHALL use a structured multi-row grid layout to organize financial insights hierarchically.

#### Scenario: Three-Row Dashboard Structure

- **Given** the dashboard is rendered with data
- **Then** the content MUST be organized into three distinct rows
- **And** Row 1 MUST contain the Split Category Panels (Income on left, Expense on right)
- **And** Row 2 MUST contain the Summary Pie Chart (left) and Income vs Expense Trend Chart (right)
- **And** Row 3 MUST contain the Top Categories Chart (full width)
- **And** on mobile devices, these components MUST stack vertically in the same logical order

### Requirement: Split Category Panels

The application SHALL provide distinct, side-by-side panels for detailed income and expense breakdowns.

#### Scenario: Income and Expense separation

- **Given** Row 1 of the dashboard is rendered
- **Then** two separate components MUST be displayed: "Income by Category" and "Expense by Category"
- **And** each panel MUST be collapsible
- **And** the "Income by Category" panel MUST be on the left (or top on mobile)
- **And** the "Expense by Category" panel MUST be on the right (or bottom on mobile)
- **And** both panels SHOULD default to a collapsed state to save vertical space

### Requirement: Income vs Expense Trend Chart

The application SHALL visualize the relationship between income, expense, and net result over time.

#### Scenario: Dual-Axis Trend Visualization

- **Given** Row 2 of the dashboard is rendered
- **Then** a mixed bar/line chart MUST be displayed
- **And** it MUST show Income as green bars
- **And** it MUST show Expense as red bars
- **And** it MUST show Net Income as a blue line overlay
- **And** the chart aggregation (Daily vs Monthly) MUST adapt automatically based on the selected date range duration (e.g., > 2 months switches to Monthly)

### Requirement: Top Categories Analysis

## Constraints

- Overview tab must be the default view when data is loaded
- Category panels must support both collapsed and expanded states
- Semantic colors (green for income, red for expenses) must be consistent

## Examples

## Notes

This spec focuses on the Overview tab layout structure and interactive elements.
