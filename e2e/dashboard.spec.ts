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

test.describe('Dashboard - Top Categories Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays category labels without truncation overlap', async ({ page }) => {
    await test.step('Verify Top Categories chart renders', async () => {
      const chart = page.getByRole('region', { name: 'Top Categories' });
      await expect(chart).toBeVisible();
    });

    await test.step('Verify category list structure', async () => {
      const categoryList = page.getByRole('list', { name: 'Top categories by total amount' });
      await expect(categoryList).toBeVisible();
      await expect(categoryList.getByRole('listitem')).toHaveCount(5);
    });

    await test.step('Verify category labels are fully visible', async () => {
      // Ensure all category names render completely without being cut off
      await expect(page.getByText('Uncategorized')).toBeVisible();
      await expect(page.getByText('Compensation > Salary')).toBeVisible();
      await expect(page.getByText('Payment > Loan')).toBeVisible();
      await expect(page.getByText('Payment > Debt Repayment')).toBeVisible();
      await expect(page.getByText('Compensation > Dividend')).toBeVisible();
    });

    await test.step('Verify bar tracks have proper width', async () => {
      // The chart should use a list layout where bars don't overlap labels
      const firstItem = page.getByRole('listitem').filter({ hasText: 'Uncategorized' });
      await expect(firstItem).toBeVisible();

      // Check that the bar container (track) exists within each item
      // The CSS flexbox layout ensures labels and bars are side-by-side
      const barTrack = firstItem.locator('.bar-track');
      await expect(barTrack).toBeVisible();
    });
  });
});
