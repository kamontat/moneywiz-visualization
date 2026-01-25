# Tasks: Refine Dashboard Layout

## 1. Setup & Initial Refactoring
- [x] Create `DateRangeDisplay` atom component. <!-- id: 1 -->
- [x] Add date extraction logic to `$lib/analytics.ts` to get first and last transaction dates. <!-- id: 2 -->

## 2. Dashboard Header & Tabs
- [x] Refactor `src/routes/+page.svelte` to include the centered title and date range. <!-- id: 3 -->
- [x] Implement the Tab system in `src/routes/+page.svelte` (Overview tab). <!-- id: 4 -->

## 3. UI refinements
- [x] Update `SummaryCards.svelte` to match the "quick summary" design requirements. <!-- id: 5 -->
- [x] Modify `src/routes/+layout.svelte` to swap file name and "Upload successful" message hierarchy. <!-- id: 6 -->

## 4. Verification
- [x] Run unit tests: `bun vitest run`. <!-- id: 7 -->
- [x] Run E2E tests: `bun test:e2e`. <!-- id: 8 -->
- [x] Visual verification of the new layout. <!-- id: 9 -->
