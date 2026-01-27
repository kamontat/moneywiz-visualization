import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const BASE_URL = 'http://localhost:4173';

describe('CSV Preview Table Layout', () => {
  beforeEach(async () => {
    await page.goto(BASE_URL);
  });

  test('preview table displays all columns without wrapping headers', async () => {
    // Upload CSV file to show preview table
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('static/data/report.csv');

    // Navigate to Preview tab and verify table is visible
    // Click the Preview tab to view the data table
    await page.getByRole('button', { name: 'Preview' }).click();

    // Wait for the Preview tab to be active
    await expect.element(page.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-current', 'page');

    const table = page.locator('table').first();
    await expect.element(table).toBeVisible();

    // Verify all column headers are visible and not wrapped
    // Scope to table in the visible preview panel
    const headers = table.locator('thead th');
    const headerCount = await headers.count();
    expect(headerCount).toBe(12);

    const checkHeader = table.locator('thead th:has-text("Check #")');
    await expect.element(checkHeader).toBeVisible();

    const box = await checkHeader.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeLessThan(50);
    }

    // Verify table extends to full width of container
    // Find the table and its immediate parent (overflow container)
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

    // Verify all column data is visible without horizontal scroll cutoff
    const lastColumn = table.locator('thead th:last-child');
    await expect.element(lastColumn).toBeVisible();

    const lastColumnBox = await lastColumn.boundingBox();
    expect(lastColumnBox).toBeTruthy();

    if (lastColumnBox) {
      expect(lastColumnBox.x + lastColumnBox.width).toBeGreaterThan(0);
    }
  });

  test('tab switching between Overview and Preview works', async () => {
    // Upload CSV file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('static/data/report.csv');

    // Verify Overview tab is default
    const overviewTab = page.getByRole('button', { name: 'Overview' });
    await expect.element(overviewTab).toHaveAttribute('aria-current', 'page');

    // Switch to Preview tab
    await page.getByRole('button', { name: 'Preview' }).click();

    const previewTab = page.getByRole('button', { name: 'Preview' });
    await expect.element(previewTab).toHaveAttribute('aria-current', 'page');

    const table = page.locator('table').first();
    await expect.element(table).toBeVisible();

    // Switch back to Overview tab
    await page.getByRole('button', { name: 'Overview' }).click();

    await expect.element(overviewTab).toHaveAttribute('aria-current', 'page');

    // Preview tab should no longer be active
    await expect.element(previewTab).not.toHaveAttribute('aria-current', 'page');
  });

  test('dropdown changes displayed row count', async () => {
    // Upload CSV file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('static/data/report.csv');

    // Navigate to Preview tab
    // It might need time to upload/process
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Preview' }).click();
    await expect.element(page.locator('table').first()).toBeVisible();

    // Verify default row count is 5
    const rows = page.locator('tbody tr');
    await expect.element(rows).toHaveCount(5);

    const dropdown = page.locator('#row-limit-select');
    await expect.element(dropdown).toHaveValue('5');

    await expect.element(page.getByText(/Showing first 5 rows/)).toBeVisible();

    // Change row count to 10
    await dropdown.selectOption('10');

    await expect.element(rows).toHaveCount(10);

    await expect.element(page.getByText(/Showing first 10 rows/)).toBeVisible();

    // Change row count to 100
    await dropdown.selectOption('100');

    await expect.element(rows).toHaveCount(100);

    await expect.element(page.getByText(/Showing first 100 rows/)).toBeVisible();
  });
});
