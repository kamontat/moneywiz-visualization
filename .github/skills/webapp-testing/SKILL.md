---
name: webapp-testing
description: Toolkit for interacting with and testing the MoneyWiz SvelteKit application using Playwright. Supports verifying CSV upload, data visualization, chart rendering, and UI interactions. Includes E2E test generation with web-first assertions.
---

# MoneyWiz Web Application Testing

This skill enables comprehensive testing and debugging of the **MoneyWiz Visualization** SvelteKit application using Playwright automation and Vitest unit testing.

## Project Setup

**MoneyWiz Test Infrastructure:**
- **E2E Tests:** Playwright in `e2e/` directory (`*.spec.ts`)
- **Unit Tests:** Vitest with SvelteKit/Svelte component support
- **Test Runner:** `bun test` (all), `bun run test:e2e` (E2E only)
- **Dev Server:** `http://localhost:5173/`
- **Package Manager:** Bun

## When to Use This Skill

Use this skill when you need to:

- Test **CSV upload flow** and data parsing
- Verify **chart rendering** and data visualization
- Validate **summary card calculations** (totals, averages)
- Test **responsive design** at multiple breakpoints
- Debug **SvelteKit component interactions**
- Capture screenshots of **financial visualizations**
- Inspect **browser console logs** for TypeScript errors
- Validate **data filtering and aggregation logic**

## Prerequisites

**Required:**
1. **Bun installed** - MoneyWiz uses Bun as package manager
2. **Dev server running** - `bun run dev` (running on `http://localhost:5173/`)
3. **Dependencies installed** - `bun install` (includes Playwright + Vitest)
4. **Test CSV file** - Located at `build/data/report.csv` or `static/data/report.csv`

**Verify Setup:**
```bash
which bun          # Verify Bun is installed
bun run dev        # Start dev server
# In another terminal:
bun run test       # Run all tests
```

## Core Capabilities for MoneyWiz

### 1. CSV Import & Data Processing

- Upload CSV files via `CsvUploadButton`
- Verify CSV parsing (MoneyWiz `sep=` format)
- Check data store updates via `csvStore`
- Validate error handling for malformed CSVs

### 2. Component Interaction Testing

- Click **Clear CSV** button to reset data
- Upload CSV files using file input
- Trigger data visualization updates
- Test chart re-renders on data changes

### 3. Data Verification

- Assert summary card values (totals, counts)
- Verify chart data points and labels
- Check category filtering accuracy
- Validate income/expense calculations
- Confirm savings rate calculations

### 4. Visual Regression Testing

- Capture screenshots of charts
- Verify legend positioning
- Check responsive layout at breakpoints (375px, 768px, 1280px, 1920px)
- Validate Tailwind CSS styling application

### 5. Debugging

- Capture full-page screenshots
- View console logs for TypeScript errors
- Inspect network requests for CSV processing
- Debug failed data transformations

## Usage Examples for MoneyWiz

### Example 1: CSV Upload and Data Verification

```typescript
import { test, expect } from '@playwright/test';

test('Upload CSV and verify dashboard updates', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Upload CSV file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('build/data/report.csv');
  
  // Verify data loaded
  await expect(page.locator('[data-testid="summary-total"]')).toBeVisible();
  
  // Check that charts render
  await expect(page.locator('canvas')).toBeVisible();  // Chart canvas
});
```

### Example 2: Clear CSV and Reset Dashboard

```typescript
test('Clear CSV resets dashboard', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Upload CSV first
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('build/data/report.csv');
  await expect(page.locator('[data-testid="summary-total"]')).toBeVisible();
  
  // Click clear button
  await page.click('button:has-text("Clear")');
  
  // Verify reset
  await expect(page.locator('[data-testid="summary-total"]')).not.toBeVisible();
});
```

### Example 3: Responsive Design Testing

```typescript
test.describe.parallel('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`renders correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:5173/');
      
      // Verify layout adapts
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Take screenshot for visual comparison
      await page.screenshot({ path: `screenshots/${name}.png` });
    });
  });
});
```

### Example 4: Chart Verification

```typescript
test('Charts render with correct data', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Upload CSV
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('build/data/report.csv');
  
  // Verify chart containers
  await expect(page.locator('[data-testid="top-categories-chart"]')).toBeVisible();
  await expect(page.locator('[data-testid="daily-expenses-chart"]')).toBeVisible();
  await expect(page.locator('[data-testid="income-expense-chart"]')).toBeVisible();
});
```

## Guidelines for MoneyWiz E2E Testing

1. **Start dev server** - Run `bun run dev` before tests (verifies `http://localhost:5173/` is accessible)
2. **Wait for data processing** - CSV parsing may take 1-2 seconds; use appropriate waits
3. **Test CSV workflows** - Upload → Parse → Render → Clear is the primary user flow
4. **Use role-based locators** - Prefer `getByRole`, `getByLabel`, `getByText` over CSS classes
5. **Verify visualizations** - Confirm charts render correctly, not just data presence
6. **Test responsive breakpoints** - Test at 375px (mobile), 768px (tablet), 1280px (desktop)
7. **Check TypeScript compilation** - Verify browser console for Vite/SvelteKit errors
8. **Use Vitest for units** - Test business logic (`src/lib/`) with Vitest
9. **Use Playwright for E2E** - Test user workflows with Playwright
10. **Name tests clearly** - Test titles should describe user intent, not implementation

## Common Patterns for MoneyWiz

### Pattern: CSV Upload Workflow

```typescript
// Standard CSV upload flow
await page.goto('http://localhost:5173/');
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('build/data/report.csv');
await expect(page.locator('[data-testid="summary-total"]')).toBeVisible();
```

### Pattern: Wait for Chart Rendering

```typescript
// Charts render asynchronously after data load
await page.waitForFunction(() => {
  const canvases = document.querySelectorAll('canvas');
  return canvases.length > 0;
}, { timeout: 5000 });
```

### Pattern: Verify Summary Card Values

```typescript
// Check that summary cards display expected values
const totalText = await page.locator('[data-testid="summary-total"]').textContent();
expect(totalText).toMatch(/\d+/);
```

### Pattern: Responsive Testing

```typescript
// Test at specific viewport size
await page.setViewportSize({ width: 375, height: 667 });
await expect(page.locator('header')).toBeFitted();  // Fits without overflow
```

### Pattern: Capture Chart Screenshots

```typescript
// Screenshot chart area for visual regression
const chart = page.locator('[data-testid="daily-expenses-chart"]');
await chart.screenshot({ path: 'charts/daily-expenses.png' });
```

### Pattern: Check Browser Errors

```typescript
const logs: string[] = [];
page.on('console', (msg) => logs.push(msg.text()));
page.on('pageerror', (err) => logs.push(err.toString()));

// After test
if (logs.some(l => l.includes('error'))) {
  console.error('Browser errors:', logs);
}
```

## MoneyWiz Specific Notes

### Using Bun Package Manager

MoneyWiz uses **Bun**, not npm:
```bash
# ✅ Correct
bun install
bun run dev
bun run test
bun run test:e2e

# ❌ Do NOT use
npm install
npx playwright
bunx playwright
```

### CSV Test Data

- **Location:** `build/data/report.csv` or `static/data/report.csv`
- **Format:** MoneyWiz export with `sep=` preamble
- **Parser:** Handles BOM and MoneyWiz-specific formatting
- **Best Practice:** Upload fresh copy before each test

### Component Testing

- **E2E Tests:** Test user workflows in `e2e/` directory
- **Unit Tests:** Test business logic (`src/lib/`) with Vitest
- **Component Tests:** Use Vitest with `vitest-browser-svelte`

### Performance Considerations

- CSV parsing happens client-side (may be slow for large files)
- Charts render using SVG/Canvas (verify rendering completes)
- Store updates trigger SvelteKit reactivity
- Hard waits should not exceed 5 seconds

## Limitations

- Cannot test MoneyWiz web API endpoints (not in scope - client-side only)
- CSV parsing errors should be caught and logged
- Some modern Tailwind utilities may need testing configuration
