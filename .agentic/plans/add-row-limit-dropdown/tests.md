# Tests: add-row-limit-dropdown

Test plan for validating the implementation.

## Unit Tests

- [ ] `DataPreviewPanel.svelte.spec.ts`: Dropdown renders with all 5 options (5, 10, 20, 50, 100)
- [ ] `DataPreviewPanel.svelte.spec.ts`: Default selection is 5 rows
- [ ] `DataPreviewPanel.svelte.spec.ts`: Selecting 10 displays 10 rows when data has enough rows
- [ ] `DataPreviewPanel.svelte.spec.ts`: Row count message reflects selected limit
- [ ] `DataPreviewPanel.svelte.spec.ts`: Dropdown hidden when no data loaded

## Integration Tests

N/A

## E2E Tests

- [ ] `preview-table.spec.ts`: Dropdown is visible in Preview tab
- [ ] `preview-table.spec.ts`: Changing dropdown updates displayed row count

## Manual Testing

0. Start dev server with `bun run dev`
1. Upload a CSV file with more than 100 rows
2. Navigate to Preview tab
3. Verify dropdown shows "5" as default
4. Select "10" - verify 10 rows display
5. Select "100" - verify up to 100 rows display
6. Verify row count message updates (e.g., "Showing first 10 rows of 150")
7. Test with small dataset (< 5 rows) - dropdown should still appear

## Edge Cases

- [ ] Dataset with exactly 5 rows - no "Showing X of Y" message needed
- [ ] Dataset with fewer rows than selected limit - show all rows
- [ ] Select 100 when only 50 rows exist - shows all 50

## Test Commands

```bash
# Run all unit tests
bun run test:unit
```

```bash
# Run DataPreviewPanel component tests only
bun vitest run --project=client DataPreviewPanel
```

```bash
# Run all e2e tests
bun run test:e2e
```

```bash
# Run preview-table e2e test only
bun vitest run --project=e2e preview-table
```
