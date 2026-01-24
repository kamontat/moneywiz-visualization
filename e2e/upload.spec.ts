import { test, expect } from '@playwright/test';

test.describe('CSV Upload - MoneyWiz file', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sets a CSV file and shows preview', async ({ page }) => {
    await test.step('Upload CSV via hidden input', async () => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('static/data/report.csv');
    });

    await test.step('Verify upload summary and preview appear', async () => {
      await expect(page.getByText('Upload successful')).toBeVisible();
      await expect(page.getByRole('heading', { name: /report\.csv/i })).toBeVisible();
      await expect(page.getByRole('table')).toBeVisible();
    });
  });
});
