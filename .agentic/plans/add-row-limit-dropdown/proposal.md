# Proposal: add-row-limit-dropdown

## Objective

Allow users to select how many transaction rows to display in the Preview tab.

## Description

Currently the Preview tab shows only the first 5 rows of uploaded CSV data. Users who want to inspect more transactions must rely on external tools. This change adds a dropdown selector that lets users choose to display 5, 10, 20, 50, or 100 rows, giving them flexibility to view more data when needed while maintaining performance by default.

## Acceptance Criteria

- [ ] A dropdown appears in the Preview tab for selecting row count
- [ ] Dropdown options include: 5, 10, 20, 50, and 100
- [ ] Default selection is 5 rows (maintains current behavior)
- [ ] Selecting a different option updates the displayed rows immediately
- [ ] The "Showing first X rows of N" message reflects the selected limit
- [ ] Dropdown styling matches the application design system

## Out of Scope

- Persisting the selected row limit across page reloads
- Adding full pagination with page navigation
- Adding search or filter functionality to the preview

## References

- [biz-preview-tab spec](../../specs/biz-preview-tab/spec.md)
