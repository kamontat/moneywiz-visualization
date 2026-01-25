# Tasks: Refine UI Dashboard and Header

## Implementation
- [x] Move "Dashboard" heading inside data check in `src/routes/+page.svelte`. <!-- id: 1 -->
- [x] Add GitHub link to `AppHeader.svelte`. <!-- id: 2 -->
- [x] Style the GitHub link to be consistent with modern header design. <!-- id: 3 -->
- [x] Invert layout in `src/routes/+layout.svelte` (Dashboard above Preview). <!-- id: 9 -->
- [x] Implement collapsable logic for the Preview table in `+layout.svelte`. <!-- id: 10 -->

## Validation
- [x] Update `src/routes/page.svelte.spec.ts` for conditional heading. <!-- id: 4 -->
- [x] Update `src/components/organisms/AppHeader.svelte.spec.ts` for GitHub link. <!-- id: 5 -->
- [x] Update `src/routes/layout.svelte.spec.ts` for reordered content and collapse toggle. <!-- id: 11 -->
- [x] Run unit tests: `bun run test:unit`. <!-- id: 6 -->
- [x] Run E2E tests: `bun run test:e2e`. <!-- id: 7 -->
- [x] Validate OpenSpec: `openspec validate refine-ui-dashboard-header --strict --no-interactive`. <!-- id: 8 -->
