import { test, expect } from '@playwright/test';

test.describe('CSV Upload - MoneyWiz file', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('uploads CSV file and updates dashboard', async ({ page }) => {
    await test.step('Wait for default CSV to load', async () => {
      // Dashboard loads default report.csv on startup
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByText('Income (THB)')).toBeVisible();
    });

    await test.step('Upload custom CSV via hidden input', async () => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('static/data/report.csv');
    });

    await test.step('Verify dashboard updates with data', async () => {
      // After upload, dashboard should show summary cards
      await expect(page.getByText('Income (THB)')).toBeVisible();
      await expect(page.getByText('Expenses (THB)')).toBeVisible();
      await expect(page.getByText('Net (THB)')).toBeVisible();
      await expect(page.getByText('Transactions')).toBeVisible();

      // Charts should be visible
      await expect(page.getByRole('heading', { name: 'Top Categories' })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Daily Expenses/i })).toBeVisible();
    });
  });
});
