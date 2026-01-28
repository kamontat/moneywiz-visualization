# Spec: tech-testing-strategy

## Purpose

Define the global testing strategy, distinguishing between Unit (components) and E2E (routes/flows) testing, and establishing standards for test data management.

## Requirements

### Requirement: Test Categorization

Tests SHALL be strictly categorized by their location and scope.

#### Scenario: Component Testing (Unit)
- **Given** a reusable Svelte component in `src/components/`
- **Then** unit tests MUST be valid
- **And** tests SHOULD be co-located (e.g., `Component.svelte.spec.ts`)
- **And** tests SHOULD verify rendering, props, and internal state logic

#### Scenario: Route/App Flow Testing (E2E)
- **Given** a full page route or critical user flow (like Upload)
- **Then** tests MUST be implemented using Playwright in `e2e/`
- **And** tests MUST NOT be implemented as co-located unit tests in `src/routes/`

### Requirement: Test Data Management

Tests SHALL manage their own data needs explicitly and independently.

#### Scenario: E2E Data Generation
- **Given** an E2E test requires CSV data input
- **Then** the test MUST programmatically generate a unique CSV string or buffer
- **And** the test MUST NOT use shared static files (e.g., `static/data/report.csv`)
- **And** generated data MUST contain only the minimal records needed for the specific test case

#### Scenario: Data Cleanup
- **Given** a test creates temporary state (browser upload)
- **Then** the state usually clears on pagereload or new context, but specific cleanup steps SHOULD be added if side effects persist (e.g. LocalStorage)

## Constraints

- Playwright tests run in parallel; shared files cause race conditions.
- Static files in `static/` are for manual demo/dev use only, not automation.

## Examples

### Example: E2E Test with Generated Data

```typescript
import { test, expect } from '@playwright/test';
import { generateCsv } from './utils/csv-generator';

test('uploads custom data', async ({ page }) => {
    // Generate isolated data
    const csvData = generateCsv([{ Account: 'Test Bank', Amount: '500.00' }]);

    // Convert to buffer for upload
    await page.locator('input[type="file"]').setInputFiles({
        name: 'test.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvData)
    });

    await expect(page.getByText('500.00')).toBeVisible();
});
```

## Notes

This strategy prevents "brittle" tests where changing a shared file breaks unrelated tests. It also clarify where to put new tests: simple components -> unit, page flows -> e2e.
