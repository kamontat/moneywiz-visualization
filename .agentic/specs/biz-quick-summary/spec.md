# Spec: biz-quick-summary

## Purpose

Defines the design requirements for the Quick Summary section of the MoneyWiz dashboard, which provides high-level financial metrics separated from detailed charts.

## Requirements

### Requirement: Quick Summary Display

The application SHALL provide a high-level summary of financial data that is distinct from detailed charts.

#### Scenario: Separation from Charts

- **Given** the dashboard is rendered with data
- **Then** the "Quick Summary" (SummaryCards) MUST be visually separated from the detailed chart panels
- **And** it SHOULD be placed prominently at the top of the Overview tab

### Requirement: Semantic Coloring

The Quick Summary cards MUST use distinct semantic colors to improve readability and visual hierarchy.

#### Scenario: Metric Colors

- **Income** SHALL be displayed with a Green theme.
- **Expenses** SHALL be displayed with a Red theme.
- **Net / Cash Flow** SHALL be displayed with a Blue theme.
- **Saving Rate** SHALL be displayed with a Purple theme.

## Constraints

- Quick Summary must always appear above detailed visualizations
- Summary cards must be visually distinct from chart panels
- All text on colored backgrounds MUST maintain WCAG AA contrast ratios against the background color.

## Examples

## Notes

This spec covers the placement and visual separation of the Quick Summary section, not the specific metrics displayed within.
