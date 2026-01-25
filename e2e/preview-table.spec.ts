import { test, expect } from '@playwright/test';

test.describe('CSV Preview Table Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('preview table displays all columns without wrapping headers', async ({ page }) => {
    await test.step('Upload CSV file to show preview table', async () => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('static/data/report.csv');
    });

    await test.step('Verify preview table is visible', async () => {
      // Expand preview section
      await page.getByRole('button', { name: 'Show Table' }).click();

      await expect(page.getByRole('heading', { name: /Preview/ })).toBeVisible();
      const table = page.locator('table').first();
      await expect(table).toBeVisible();
    });

    await test.step('Verify all column headers are visible and not wrapped', async () => {
      const headers = page.locator('thead th');
      const headerCount = await headers.count();
      expect(headerCount).toBe(12);

      const checkHeader = page.locator('thead th:has-text("Check #")');
      await expect(checkHeader).toBeVisible();

      const box = await checkHeader.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.height).toBeLessThan(50);
      }
    });

    await test.step('Verify table extends to full width of container', async () => {
      // Find the table and its immediate parent (overflow container)
      const table = page.locator('table').first();
      const overflowContainer = page.locator('.border.border-mw-border.rounded-lg').filter({ has: table }).first();

      const containerBox = await overflowContainer.boundingBox();
      const tableBox = await table.boundingBox();

      expect(containerBox).toBeTruthy();
      expect(tableBox).toBeTruthy();

      if (containerBox && tableBox) {
        // Table should be at least as wide as the container (for scrollability)
        // When content needs to scroll, table width >= container width
        expect(tableBox.width).toBeGreaterThanOrEqual(containerBox.width - 2);
      }
    });

    await test.step('Verify all column data is visible without horizontal scroll cutoff', async () => {
      const lastColumn = page.locator('thead th:last-child');
      await expect(lastColumn).toBeVisible();

      const box = await lastColumn.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        expect(box.x + box.width).toBeGreaterThan(0);
      }
    });
  });
});
