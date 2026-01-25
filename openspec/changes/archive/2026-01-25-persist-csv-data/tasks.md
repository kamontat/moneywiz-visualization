# Tasks: Persist CSV Data

## Phase 1: Infrastructure

- [x] Define storage keys and types in `src/lib/stores/csv.ts` <!-- id: 0 -->
- [x] Implement `localStorage` hydration during `csvStore` initialization <!-- id: 1 -->
- [x] Update `csvStore.set` to persist data to `localStorage` <!-- id: 2 -->
- [x] Update `csvStore.reset` to remove data from `localStorage` <!-- id: 3 -->

## Phase 2: Component Integration

- [x] Update `src/routes/+layout.svelte` to hydrate its local state from `csvStore` on mount <!-- id: 4 -->
- [x] Ensure `AppHeader` and `SummaryCards` correctly reflect hydrated data <!-- id: 5 -->

## Phase 3: Testing & Validation

- [x] Update `src/lib/stores/csv.spec.ts` to test persistence logic <!-- id: 6 -->
- [x] Add E2E test in `e2e/persistence.spec.ts` (or update `e2e/upload.spec.ts`) <!-- id: 7 -->
  - Test: Upload -> Refresh -> Data exists
  - Test: Upload -> Clear -> Refresh -> Data gone
- [x] Verify no SSR errors in build/prerender phase <!-- id: 8 -->
