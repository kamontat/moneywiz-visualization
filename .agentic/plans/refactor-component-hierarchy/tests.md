# Tests: refactor-component-hierarchy

Test plan for validating the implementation.

## Unit Tests

- [ ] `atoms/Button`: renders slots and handles clicks
- [ ] `atoms/Title`: renders with correct heading levels
- [ ] `molecules/UploadCsv`: triggers file selection
- [ ] `molecules/NavigationItem`: handles active/inactive states
- [ ] `organisms/OverviewTab`: renders all sub-charts
- [ ] `organisms/PreviewTab`: renders data table

## Integration Tests

- [ ] `Dashboard` organism integrates Header, Tabs, and Content correctly
- [ ] Tab switching toggles between `OverviewTab` and `PreviewTab`

## E2E Tests

- [ ] Full smoke test of Dashboard loading
- [ ] Upload CSV flow
- [ ] Clear Data flow
- [ ] Tab navigation checks

## Manual Testing

1. Visual check of Button styles (consistency).
2. Visual check of Panel borders/shadows (consistency via `DashboardPanel`).
3. Verify mobile layout of the new `Header` molecule.

## Edge Cases

- [ ] Components receiving empty slots
- [ ] Layout behavior when atoms have very long text

## Test Commands

```bash
# Run unit tests
bun run test:unit
```

```bash
# Run E2E tests
bun run test:e2e
```
