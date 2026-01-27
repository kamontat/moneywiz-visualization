# Tasks: add-row-limit-dropdown

Technical implementation steps for the proposal.

## Prerequisites

- [ ] Review current `DataPreviewPanel.svelte` component structure
- [ ] Understand the existing row limit implementation

## Implementation Steps

### Step 0: Add row limit state and options

Add reactive state for the selected row limit and define available options.

**Files to modify:**
- `src/components/organisms/DataPreviewPanel.svelte`

**Changes:**
- Replace `const maxPreviewRows = 5` with `let maxPreviewRows = $state(5)`
- Add constant array for options: `[5, 10, 20, 50, 100]`

### Step 1: Add dropdown UI element

Add a select dropdown above the table to change the row limit.

**Files to modify:**
- `src/components/organisms/DataPreviewPanel.svelte`

**Changes:**
- Add a header section with label and dropdown
- Style dropdown to match application design system
- Bind dropdown value to `maxPreviewRows` state
- Position dropdown above the table, aligned to the right

### Step 2: Update unit tests

Add tests for the new dropdown functionality.

**Files to modify:**
- `src/components/organisms/DataPreviewPanel.svelte.spec.ts`

**Changes:**
- Add test: dropdown renders with correct options
- Add test: changing selection updates displayed rows
- Update existing row limit tests to account for default behavior

### Step 3: Update E2E tests

Add E2E test for dropdown interaction.

**Files to modify:**
- `e2e/preview-table.spec.ts`

**Changes:**
- Add test: dropdown is visible in Preview tab
- Add test: selecting a different limit shows more rows

## Verification

- [ ] Run `bun run test:unit` - all unit tests pass
- [ ] Run `bun run test:e2e` - all e2e tests pass
- [ ] Manually verify: Dropdown appears and is styled correctly
- [ ] Manually verify: Changing selection updates table rows
- [ ] Manually verify: Row count message updates dynamically
