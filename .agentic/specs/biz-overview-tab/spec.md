# Spec: biz-overview-tab

## Purpose

Defines the layout and component requirements for the Overview tab in the MoneyWiz dashboard, including category breakdowns, navigation controls, and financial data presentation.

## Requirements

### Requirement: Overview Tab Layout

The Overview tab SHALL serve as the primary view for financial analysis, presenting key metrics and controls clearly.

#### Scenario: Header and Controls

- **Given** a CSV file is successfully uploaded
- **Then** the Dashboard header MUST display the transaction date range on the top left
- **And** the "Dashboard" title MUST be centered at the top
- **And** a navigation tab system MUST be provided below the header to switch between Overview and Preview views

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

## Constraints

- Overview tab must be the default view when data is loaded
- Category panels must support both collapsed and expanded states
- Semantic colors (green for income, red for expenses) must be consistent

## Examples

## Notes

This spec focuses on the Overview tab layout structure and interactive elements.
