import { test, expect } from '@playwright/test';

test.describe('CSV Upload - MoneyWiz file', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('uploads CSV file and updates dashboard', async ({ page }) => {
    await test.step('Verify empty state on fresh load', async () => {
      // Dashboard heading should be hidden when no data
      await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();
      await expect(page.getByText('Welcome to MoneyWiz Report')).toBeVisible();
    });

    await test.step('Upload CSV via hidden input', async () => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('static/data/report.csv');
    });

    await test.step('Verify dashboard updates with data', async () => {
      // After upload, dashboard should show summary cards
      // Use first() to avoid ambiguity if labels appear elsewhere
      await expect(page.getByText('Income', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Expenses', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Net / Cash Flow', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Saving Rate')).toBeVisible();

      // Charts should be visible
      await expect(page.getByRole('heading', { name: 'Top Categories' })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Daily Expenses/i })).toBeVisible();
    });
  });

  test('clears uploaded CSV and resets to empty state', async ({ page }) => {
    await test.step('Upload CSV file first', async () => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('static/data/report.csv');

      // Verify upload was successful - preview should appear
      await expect(page.getByText('Saving Rate')).toBeVisible();
    });

    await test.step('Clear button should be visible after upload', async () => {
      const clearButton = page.getByRole('button', { name: 'Clear loaded CSV' });
      await expect(clearButton).toBeVisible();
    });

    await test.step('Click clear button', async () => {
      await page.getByRole('button', { name: 'Clear loaded CSV' }).click();
    });

    await test.step('Verify data is cleared', async () => {
      // Preview section should be gone
      await expect(page.getByText('Saving Rate')).not.toBeVisible();

      // Clear button should be hidden
      await expect(page.getByRole('button', { name: 'Clear loaded CSV' })).not.toBeVisible();

      // Dashboard should show empty state message
      await expect(page.getByText('Welcome to MoneyWiz Report')).toBeVisible();
    });
  });
});
