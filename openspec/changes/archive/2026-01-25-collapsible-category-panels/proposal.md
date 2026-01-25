# Proposal: Collapsible Category Panels

## Problem
The current dashboard lacks a detailed breakdown of income and expenses by category that is both interactive and visually consistent with a modern UI. Users see charts but cannot drill down into specific category totals in a list format that mirrors the provided screenshot.

## Proposed Change
Implement a new organism `CategoryBreakdown.svelte` that displays income and expenses in collapsible panels.

### Key Features
1. **Rounded Panels**: Panels will have rounded corners (`rounded-xl` or similar).
2. **Interactive Headers**: The entire header area of the collapsible panel will be clickable to toggle expansion.
3. **Semantic Coloring**: 
   - Income headers will use a light green background.
   - Expense headers will use a light red background.
4. **Detailed List**: When expanded, show categories with their totals and percentages.
5. **Layout Integration**: Place these panels below the existing charts in the "Overview" tab.

## Impact
- **UI/UX**: Improves data accessibility and provides a more professional feel.
- **Components**: Adds `CategoryBreakdown` organism.
- **Tests**: Requires new unit and E2E tests for the collapsible behavior and data rendering.
