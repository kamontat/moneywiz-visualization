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

    await test.step('Navigate to Preview tab and verify table is visible', async () => {
      // Click the Preview tab to view the data table
      await page.getByRole('button', { name: 'Preview' }).click();

      // Wait for the Preview tab to be active
      await expect(page.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-current', 'page');

      const table = page.locator('table').first();
      await expect(table).toBeVisible();
    });

    await test.step('Verify all column headers are visible and not wrapped', async () => {
      // Scope to table in the visible preview panel
      const table = page.locator('table').first();
      const headers = table.locator('thead th');
      const headerCount = await headers.count();
      expect(headerCount).toBe(12);

      const checkHeader = table.locator('thead th:has-text("Check #")');
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
      const table = page.locator('table').first();
      const lastColumn = table.locator('thead th:last-child');
      await expect(lastColumn).toBeVisible();

      const box = await lastColumn.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        expect(box.x + box.width).toBeGreaterThan(0);
      }
    });
  });

  test('tab switching between Overview and Preview works', async ({ page }) => {
    await test.step('Upload CSV file', async () => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('static/data/report.csv');
    });

    await test.step('Verify Overview tab is default', async () => {
      const overviewTab = page.getByRole('button', { name: 'Overview' });
      await expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });

    await test.step('Switch to Preview tab', async () => {
      await page.getByRole('button', { name: 'Preview' }).click();

      const previewTab = page.getByRole('button', { name: 'Preview' });
      await expect(previewTab).toHaveAttribute('aria-current', 'page');

      const table = page.locator('table').first();
      await expect(table).toBeVisible();
    });

    await test.step('Switch back to Overview tab', async () => {
      await page.getByRole('button', { name: 'Overview' }).click();

      const overviewTab = page.getByRole('button', { name: 'Overview' });
      await expect(overviewTab).toHaveAttribute('aria-current', 'page');

      // Preview tab should no longer be active
      const previewTab = page.getByRole('button', { name: 'Preview' });
      await expect(previewTab).not.toHaveAttribute('aria-current', 'page');
    });
  });

  test('dropdown changes displayed row count', async ({ page }) => {
    await test.step('Upload CSV file', async () => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('static/data/report.csv');
    });

    await test.step('Navigate to Preview tab', async () => {
      // It might need time to upload/process
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: 'Preview' }).click();
      await expect(page.locator('table').first()).toBeVisible();
    });

    await test.step('Verify default row count is 5', async () => {
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(5);

      const dropdown = page.locator('#row-limit-select');
      await expect(dropdown).toHaveValue('5');

      await expect(page.getByText(/Showing first 5 rows/)).toBeVisible();
    });

    await test.step('Change row count to 10', async () => {
      const dropdown = page.locator('#row-limit-select');
      await dropdown.selectOption('10');

      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(10);
      
      await expect(page.getByText(/Showing first 10 rows/)).toBeVisible();
    });

    await test.step('Change row count to 100', async () => {
      const dropdown = page.locator('#row-limit-select');
      await dropdown.selectOption('100');
      
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(100);
      
      await expect(page.getByText(/Showing first 100 rows/)).toBeVisible();
    });
  });
});
