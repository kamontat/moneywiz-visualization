# Tasks: Implement Atomic Design

## Preparation
- [x] Research all existing component usages across `src/routes/` and other components. <!-- id: 0 -->

## Reorganization
- [x] Create `src/components/atoms`, `src/components/molecules`, and `src/components/organisms` directories. <!-- id: 1 -->
- [x] Move `MoneyLogo` to `atoms/`. <!-- id: 2 -->
- [x] Move `CsvUploadButton` to `molecules/`. <!-- id: 3 -->
- [x] Move `AppHeader`, `SummaryCards`, and all Chart components to `organisms/`. <!-- id: 4 -->

## Refactoring
- [x] Update imports in `src/routes/+page.svelte`. <!-- id: 5 -->
- [x] Update imports in `src/routes/+layout.svelte`. <!-- id: 6 -->
- [x] Update internal component imports (e.g., in `AppHeader.svelte`, `SummaryCards.svelte`). <!-- id: 7 -->
- [x] Update imports in all `.spec.ts` files for components. <!-- id: 8 -->

## Validation
- [x] Run `bun vitest run --project=client` to ensure all component tests pass. <!-- id: 9 -->
- [x] Run `bun run test:e2e` to ensure the application still works correctly in the browser. <!-- id: 10 -->
- [x] Run `bun run build` to ensure the project still builds successfully. <!-- id: 11 -->
