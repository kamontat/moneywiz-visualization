# Tasks: Refactor Data Preview Panel

## Phase 1: Implementation
- [x] Create `src/components/organisms/DataPreviewPanel.svelte` with new design and Svelte 5 syntax. <!-- id: 1 -->
- [x] Refactor `src/routes/+layout.svelte` to use the new component. <!-- id: 2 -->
- [x] Ensure `+layout.svelte` still passes `parsedUpload` data correctly. <!-- id: 3 -->

## Phase 2: Testing
- [x] Add unit test `src/components/organisms/DataPreviewPanel.svelte.spec.ts`. <!-- id: 4 -->
- [x] Update existing E2E tests (`e2e/preview-table.spec.ts` if exists) or add new verification in `e2e/dashboard.spec.ts`. <!-- id: 5 -->

## Phase 3: Validation
- [x] Verify collapse/expand interaction. <!-- id: 6 -->
- [x] Verify responsive table behavior. <!-- id: 7 -->
