# Tests: integrate-prettier-eslint

Test plan for validating the implementation.

## Unit Tests

- [ ] No new unit tests required (this is a tooling change)

## Integration Tests

- [ ] Verify ESLint detects intentional style violations in a test file
- [ ] Verify Prettier correctly formats a test file with inconsistent style
- [ ] Verify ESLint and Prettier don't conflict with each other

## E2E Tests

- [ ] No new E2E tests required (this is a tooling change)

## Manual Testing

1. Create a test Svelte component with intentional linting errors
2. Run `bun run lint` and verify errors are reported
3. Run `bun run lint:fix` and verify errors are auto-fixed where possible
4. Create a file with inconsistent formatting
5. Run `bun run format` and verify file is properly formatted
6. Open VS Code and edit a file, verify ESLint warnings appear in real-time
7. Save a file in VS Code and verify it auto-formats (if enabled)
8. Run existing test suite to ensure no regressions

## Edge Cases

- [ ] Test with files containing syntax errors
- [ ] Test with files that are intentionally excluded (.prettierignore)
- [ ] Test with mixed indentation (tabs vs spaces)
- [ ] Test with very long lines
- [ ] Test with Svelte files using Runes syntax
- [ ] Test with TypeScript files

## Test Commands

```bash
# Run linting
bun run lint
```

```bash
# Auto-fix linting issues
bun run lint:fix
```

```bash
# Check formatting
bun run format:check
```

```bash
# Apply formatting
bun run format
```

```bash
# Run all tests to ensure no regressions
bun run test
```
