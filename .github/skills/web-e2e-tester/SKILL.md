---
name: web-e2e-tester
description: Write and run E2E tests for MoneyWiz. Use when validating full user flows (e.g., CSV upload), verifying chart rendering, ensuring data persistence, or running regression tests with Playwright.
---

## Commands

- `bun run test:e2e`: Run all tests.

## Writing Tests

- **Directory**: `e2e/`.
- **Naming**: `feature-name.spec.ts`.

### Example

```typescript
import { test, expect } from '@playwright/test'

test('uploads csv', async ({ page }) => {
	await page.goto('/')
	await page.getByLabel('Upload CSV').setInputFiles('test-data.csv')
	await expect(page.getByText('Total Income')).toBeVisible()
})
```

## Checklist

- [ ] Use `getByRole` or `getByLabel`.
- [ ] Wait for UI stability (auto-waiting).
- [ ] Clean up test data if needed (though usually ephemeral).
