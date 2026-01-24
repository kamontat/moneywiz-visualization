import { test, expect } from '@playwright/test';

test.describe('Dashboard - Basic summaries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders heading and summary cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Cards section should show Income, Expenses, Net, Transactions
    await expect(page.getByText('Income (THB)')).toBeVisible();
    await expect(page.getByText('Expenses (THB)')).toBeVisible();
    await expect(page.getByText('Net (THB)')).toBeVisible();
    await expect(page.getByText('Transactions')).toBeVisible();
  });

  test('renders charts', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Top Categories' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Daily Expenses/i })).toBeVisible();
  });
});
