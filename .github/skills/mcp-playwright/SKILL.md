---
name: mcp-playwright
description: Browser automation and testing using Playwright. Use when writing/running E2E tests (e2e/*.spec.ts), debugging test failures, or automating complex browser workflows.
---

# Playwright Automation

## Workflow

1.  **Locate Test**: Find the relevant `.spec.ts` file in `e2e/`.
2.  **Run Test**: Use `run_in_terminal` with `bun run test:e2e`.
3.  **Debug**: Use `bun run test:e2e --debug` or `--ui`.

## Best Practices

- **Locators**: Use `getByRole`, `getByText`. Avoid CSS selectors.
- **Assertions**: `await expect(locator).toBeVisible()`.
- **Isolation**: Tests should be independent.

## Application Context
- **Base URL**: `http://localhost:5173`
- **Config**: `playwright.config.ts`
