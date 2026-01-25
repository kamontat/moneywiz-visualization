## ADDED Requirements

### Requirement: Separated Category Breakdown Components
The application SHALL provide separate reusable components for income and expense category breakdowns to enable flexible layout composition.

#### Scenario: Independent Income Category Component
- **Given** the IncomeByCategory component is used
- **Then** it MUST display a collapsible panel with "Income by Category" header
- **And** it MUST accept breakdown data and totals as props
- **And** it MUST use semantic green color scheme for the header
- **And** it MUST list categories with amounts and percentages when expanded
- **And** it MUST follow the same collapsible panel design as CategoryBreakdown

#### Scenario: Independent Expense Category Component
- **Given** the ExpenseByCategory component is used
- **Then** it MUST display a collapsible panel with "Expense by Category" header
- **And** it MUST accept breakdown data and totals as props
- **And** it MUST use semantic red color scheme for the header
- **And** it MUST list categories with amounts (displayed as negative) and percentages when expanded
- **And** it MUST follow the same collapsible panel design as CategoryBreakdown

### Requirement: Dual Bar Chart Visualization
The application SHALL provide a bar chart component that simultaneously displays income and expense trends.

#### Scenario: Chart Visual Structure
- **Given** the IncomeExpenseBarChart component is rendered
- **Then** it MUST display income as positive bars with green coloring
- **And** it MUST display expenses as negative bars with red coloring
- **And** it MUST show bars side-by-side for each time period
- **And** it MUST overlay a line chart showing the delta (income - expense)
- **And** it MUST include clear axis labels, legend, and grid lines

#### Scenario: Accessibility and Semantics
- **Given** the IncomeExpenseBarChart is rendered
- **Then** it MUST have appropriate ARIA labels for screen readers
- **And** it MUST provide role="img" or role="graphics-document" for the chart container
- **And** it MUST include a descriptive aria-label summarizing the data
- **And** color information MUST NOT be the only means of conveying information

## REMOVED Requirements

### Requirement: Combined Category Breakdown Component
**Reason**: Replaced by separate IncomeByCategory and ExpenseByCategory components for greater layout flexibility.

**Migration**: Use IncomeByCategory and ExpenseByCategory components side-by-side instead of the single CategoryBreakdown component.
