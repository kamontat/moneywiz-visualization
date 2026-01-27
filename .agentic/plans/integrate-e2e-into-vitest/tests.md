# Tests: integrate-e2e-into-vitest

Test plan for validating the implementation.

## Unit Tests

- [ ] No new unit tests required (this is a configuration change)

## Integration Tests

- [ ] Verify E2E tests run through Vitest with same results as Playwright
- [ ] Verify all three Vitest projects (server, client, e2e) work independently
- [ ] Verify running all tests together doesn't cause conflicts

## E2E Tests

- [ ] category-breakdown.spec.ts runs successfully
- [ ] currency-format.spec.ts runs successfully
- [ ] dashboard.spec.ts runs successfully
- [ ] demo.test.ts runs successfully
- [ ] filtering.spec.ts runs successfully
- [ ] header-icons.spec.ts runs successfully
- [ ] persistence.spec.ts runs successfully
- [ ] preview-table.spec.ts runs successfully
- [ ] tag-filtering.spec.ts runs successfully
- [ ] upload.spec.ts runs successfully

## Manual Testing

1. Run `bun run test:e2e` and verify all E2E tests pass
2. Run `bun run test:unit` and verify unit/component tests pass
3. Run `bun run test` and verify all tests pass together
4. Run `bun vitest run --project=e2e` and verify E2E tests run
5. Run `bun vitest run --project=client` and verify component tests run
6. Run `bun vitest run --project=server` and verify server tests run
7. Run `bun vitest` (watch mode) and verify it detects all test files
8. Verify `playwright.config.ts` no longer exists
9. Check `package.json` to confirm `@playwright/test` is removed

## Edge Cases

- [ ] Test with no preview server running (should start automatically)
- [ ] Test with port already in use
- [ ] Test running single E2E test file
- [ ] Test running E2E tests in watch mode
- [ ] Test running all projects in parallel

## Test Commands

```bash
# Run all E2E tests
bun run test:e2e
```

```bash
# Run all tests
bun run test
```

```bash
# Run specific project
bun vitest run --project=e2e
bun vitest run --project=client
bun vitest run --project=server
```

```bash
# Run specific E2E test file
bun vitest run e2e/upload.spec.ts
```

```bash
# Watch mode for E2E tests
bun vitest --project=e2e
```
