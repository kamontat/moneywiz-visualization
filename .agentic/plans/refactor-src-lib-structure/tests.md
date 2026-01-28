# Tests: refactor-src-lib-structure

Test plan for validating the implementation.

## Unit Tests

- [ ] `src/lib/analytics/*.spec.ts` - All analytics logic must pass.
- [ ] `src/lib/csv/*.spec.ts` - All CSV parsing logic must pass.
- [ ] Verify that splitting files didn't break internal dependencies (circular imports).

## Integration Tests

- [ ] Component tests that rely on these libraries (e.g. `Dashboard.svelte` using `analytics`) should pass without changes (except imports).

## E2E Tests

- [ ] `e2e/home-page.spec.ts` - Should still load valid data.
- [ ] `e2e/upload.spec.ts` - CSV upload functionality relies heavily on `csv.ts`, critical to verify.

## Manual Testing

1. Start dev server `bun run dev`.
2. Upload `static/data/report.csv`.
3. Verify Dashboard loads correctly (Charts, Summaries).
4. Verify Filters work (Date range, tags).

## Test Commands

```bash
# Run unit tests
bun run test:unit

# Run type check
bun run check

# Run specific E2E test for upload
bun run test:e2e --project=chromium e2e/upload.spec.ts
```
