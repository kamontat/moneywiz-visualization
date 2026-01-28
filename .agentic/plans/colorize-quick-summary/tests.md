# Tests: colorize-quick-summary

Test plan for validating the implementation.

## Unit Tests

- [ ] Verify `QuickSummary` component renders without errors.

## Manual Testing

1. Load the dashboard with sample CSV data.
2. Verify Income card is green.
3. Verify Expense card is red.
4. Verify Net/Cash Flow card is blue.
5. Verify Saving Rate card is purple.
6. Check that text is readable against the colored backgrounds.

## Edge Cases

- [ ] Verify appearance in Dark Mode (if applicable/supported, though currently explicit colors are being set).

## Test Commands

```bash
# Run unit tests
bun run test:unit
```
