# Implementation Tasks

## 1. Component Updates
- [ ] 1.1 Add `maxRows` prop to DataPreviewPanel.svelte (default: 10)
- [ ] 1.2 Add row count selector UI component (dropdown or button group) in DataPreviewPanel
- [ ] 1.3 Update row slicing logic to use configurable `maxRows` instead of hardcoded value
- [ ] 1.4 Update footer text to show "Showing X of Y rows"
- [ ] 1.5 Add local state management for selected row count (using $state rune)

## 2. Layout Refactoring
- [ ] 2.1 Remove DataPreviewPanel import and rendering from `src/routes/+layout.svelte`
- [ ] 2.2 Add "Preview" tab button to tab navigation in `src/routes/+page.svelte`
- [ ] 2.3 Add Preview tab content section with DataPreviewPanel in `src/routes/+page.svelte`
- [ ] 2.4 Pass csv.data to DataPreviewPanel in the new tab

## 3. Testing
- [ ] 3.1 Update DataPreviewPanel.svelte.spec.ts for new maxRows prop
- [ ] 3.2 Add unit tests for row count selector interaction
- [ ] 3.3 Update e2e/preview-table.spec.ts to navigate to Preview tab first
- [ ] 3.4 Add e2e test for row count selector functionality
- [ ] 3.5 Update e2e/dashboard.spec.ts if it references preview visibility

## 4. Validation
- [ ] 4.1 Verify no visual regression in Overview tab
- [ ] 4.2 Test tab switching between Overview and Preview
- [ ] 4.3 Test all row count options (5, 10, 20, 50, 100)
- [ ] 4.4 Verify responsive behavior on mobile/desktop
- [ ] 4.5 Run full test suite: `bun test && bun run test:e2e`
