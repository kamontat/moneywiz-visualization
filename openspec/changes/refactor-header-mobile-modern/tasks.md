# Tasks: Refactor Header Design

## Setup
- [x] Research best Tailwind combinations for glassmorphism and mobile header patterns. <!-- id: 0 -->

## Implementation
- [x] Update `AppHeader.svelte` to use semi-transparent background and `backdrop-blur-md`. <!-- id: 1 -->
- [x] Refactor `AppHeader.svelte` branding: update title to "MoneyWiz Report" and ensure it stays single-line. <!-- id: 2 -->
- [x] Update `AppHeader.svelte` "Clear" button to show only icon on mobile (`hidden sm:inline` for text). <!-- id: 3 -->
- [x] Update `CsvUploadButton.svelte` to support responsive label (hide text on mobile, show only icon). <!-- id: 4 -->
- [x] Refine the "Clear" button styles to be more consistent with a modern minimal look (pill shape/rounded). <!-- id: 5 -->

## Validation
- [x] Run `bun vitest run src/components/organisms/AppHeader.svelte.spec.ts` to ensure functionality is preserved. <!-- id: 6 -->
- [x] Run `bun run test:e2e` to verify no regressions in header interactions. <!-- id: 7 -->
- [x] Visual verification of glassmorphism and mobile layout using a local dev server (if possible, or via screenshots/Playwright trace). <!-- id: 8 -->
- [x] Run `openspec validate refactor-header-mobile-modern --strict --no-interactive`. <!-- id: 9 -->
