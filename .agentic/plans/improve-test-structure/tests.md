# Tests: improve-test-structure

Test plan for validating the implementation.

## Unit Tests

- [ ] `src/components/*.spec.ts` should continue to pass and are unaffected by this change.

## Integration Tests

- [ ] N/A (Integration tests involving routes are now E2E).

## E2E Tests

- [ ] **Home Page Flow**: Verify home page loads and accepts valid CSV upload (Refactored `page.svelte.spec.ts`).
- [ ] **Layout Elements**: Verify navigation and layout elements persist (Refactored `layout.svelte.spec.ts`).
- [ ] **Data Isolation**: Verify `category-breakdown` test uses its own unique data categories.
- [ ] **Data Isolation**: Verify `filtering` test uses its own unique data dates/amounts.
- [ ] **Error Handling**: Verify `upload` test handles invalid generated CSVs correctly (replacing `wrong-report.csv` usage).

## Manual Testing

1. Start the app with `bun run dev`.
2. Manually upload `static/data/report.csv` to ensure the app ultimately still works with the demo file (even if tests don't use it).

## Edge Cases

- [ ] Tests running in parallel should not conflict on file names (ensure generated CSVs have unique names or are passed as buffers).

## Test Commands

```bash
# Run all E2E tests
bun run test:e2e

# Run specific new test
bun run test:e2e --project=chromium -g "Home Page"
```
