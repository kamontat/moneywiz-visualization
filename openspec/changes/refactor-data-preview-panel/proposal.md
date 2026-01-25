# Proposal: Refactor and Improve Data Preview Panel

## Problem
The data preview panel is currently embedded directly in `+layout.svelte`, cluttering the layout file. It also lacks the interactive polish of the recently added `CategoryBreakdown` component (e.g., full-header clickability) and uses slightly different styling.

## Proposed Change
Extract the data preview logic into a new organism `DataPreviewPanel.svelte` and align its design with the `CategoryBreakdown` component.

### Key Features
1.  **Component Extraction**: Move UI and logic to `src/components/organisms/DataPreviewPanel.svelte`.
2.  **Full-Header Clickability**: Toggle collapse state by clicking anywhere on the header.
3.  **Consistent UI**: Use `rounded-xl`, consistent padding, and transition effects matching `CategoryBreakdown`.
4.  **Clean Layout**: Simplify `src/routes/+layout.svelte` by using the new component.

## Impact
- **Code Quality**: Better separation of concerns.
- **UI/UX**: Consistent interaction pattern for collapsible panels.
- **Maintenance**: Easier to update preview table logic in isolation.
