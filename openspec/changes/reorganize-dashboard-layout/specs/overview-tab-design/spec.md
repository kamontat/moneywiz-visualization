## MODIFIED Requirements

### Requirement: Overview Tab Layout
The Overview tab SHALL serve as the primary view for financial analysis, presenting key metrics and visualizations in a prioritized three-row layout.

#### Scenario: Three-Row Dashboard Layout
- **Given** a CSV file is successfully uploaded
- **Then** the Dashboard header MUST display the transaction date range on the top left
- **And** the "Dashboard" title MUST be centered at the top
- **And** a navigation tab system MUST be provided below the header to switch between different views (e.g., Overview, Trends)
- **And** the Overview tab MUST organize visualizations in three distinct rows:
  - **Row 1**: Income by Category (left) | Expense by Category (right) - side-by-side panels
  - **Row 2**: Income vs Expense pie chart (left) | Daily/Monthly Income vs Expense bar chart (right)
  - **Row 3**: Top Categories (full width)

#### Scenario: Responsive Layout Adaptation
- **Given** the dashboard is viewed on different screen sizes
- **Then** on desktop (md breakpoint and above), Row 1 and Row 2 MUST display as two columns
- **And** on mobile, all visualizations MUST stack vertically
- **And** Row 3 MUST always span full width

### Requirement: Collapsible Category Breakdown
The application SHALL provide detailed income and expense breakdowns in separate, side-by-side collapsible panels.

#### Scenario: Separate Income and Expense Panels
- **Given** the dashboard is rendered with data
- **Then** two separate collapsible panels MUST be displayed: "Income by Category" and "Expense by Category"
- **And** the panels MUST be positioned side-by-side in Row 1
- **And** the panels MUST have rounded corners (`rounded-xl`)
- **And** the entire header area of each panel MUST be clickable to toggle expansion
- **And** the Income panel header MUST use a semantic green background
- **And** the Expense panel header MUST use a semantic red background
- **And** when expanded, each panel MUST list categories with their total amount and percentage of the group total
- **And** expansion transitions MUST be smooth

## ADDED Requirements

### Requirement: Income vs Expense Bar Chart
The application SHALL provide a comparative bar chart showing income and expenses over time with delta visualization.

#### Scenario: Daily Mode for Short Date Ranges
- **Given** the filtered date range is less than 2 months
- **Then** the chart MUST display data in daily mode
- **And** each day MUST show two bars side-by-side: income (positive, green) and expense (negative, red)
- **And** the delta (income - expense) MUST be displayed as a line chart overlaying the bars
- **And** the x-axis MUST show day labels

#### Scenario: Monthly Mode for Long Date Ranges
- **Given** the filtered date range is 2 months or greater
- **Then** the chart MUST display data in monthly mode
- **And** each month MUST show two bars side-by-side: income (positive, green) and expense (negative, red)
- **And** the delta (income - expense) MUST be displayed as a line chart overlaying the bars
- **And** the x-axis MUST show month labels

#### Scenario: Visual Design
- **Given** the Income vs Expense bar chart is rendered
- **Then** income bars MUST be displayed as positive values with green coloring
- **And** expense bars MUST be displayed as negative values with red coloring
- **And** the delta line MUST be displayed with a contrasting color (e.g., blue or purple)
- **And** the chart MUST have clear axis labels and a legend
- **And** tooltips or labels SHOULD show exact values on hover

## REMOVED Requirements

### Requirement: Daily Expenses Chart Only
**Reason**: Replaced by more comprehensive Income vs Expense bar chart that shows both income and expenses comparatively instead of expenses in isolation.

**Migration**: The new IncomeExpenseBarChart component provides equivalent functionality plus income data, offering better insights into financial health.
