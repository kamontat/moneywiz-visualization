# Tasks: Collapsible Date Filter

## 1. Logic and Testing
- [x] Implement `filterByDateRange` in `$lib/analytics.ts`
- [x] Add unit tests in `$lib/analytics.spec.ts` for filtering scenarios:
    - [x] No filter (return all)
    - [x] Start date only
    - [x] End date only
    - [x] Both dates (inclusive)
    - [x] Invalid date strings

## 2. UI Components
- [x] Create `src/components/organisms/FilterPanel.svelte`
- [x] Implement manual date inputs with `onchange` handlers
- [x] Implement quick filter buttons with calculation logic
- [x] Styling: Add collapsible behavior with Tailwind transitions
- [x] Add component tests for `FilterPanel.svelte`:
    - [x] Toggles open/closed
    - [x] Quick buttons emit correct dates
    - [x] Manual input emits correct dates

## 3. Dashboard Integration
- [x] Update `src/routes/+page.svelte` to manage filter state (`$state`)
- [x] Integrate `FilterPanel` component above the summary cards
- [x] Update reactive derivations to use `filteredRows`
- [x] Ensure `DateRangeDisplay` correctly reflects the *filtered* range or the *data* range as appropriate (user should see what they are looking at)

## 4. E2E Validation
- [x] Add E2E tests in `e2e/filtering.spec.ts`:
    - [x] Open filter panel
    - [x] Apply "This Month" and verify data changes
    - [x] Select custom range and verify data changes
    - [x] Collapse panel and verify it stays applied
