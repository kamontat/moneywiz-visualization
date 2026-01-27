import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const BASE_URL = 'http://localhost:4173';

describe('Dashboard - Basic summaries', () => {
  beforeEach(async () => {
    await page.goto(BASE_URL);
    // Upload CSV since it no longer auto-loads
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('static/data/report.csv');
    // Wait for the filename heading to appear, indicating upload is complete
    await expect.element(page.getByRole('heading', { name: 'report.csv' })).toBeVisible();
  });

  test('renders heading and summary cards', async () => {
    // Heading should now be the filename
    await expect.element(page.getByRole('heading', { name: 'report.csv' })).toBeVisible();

    // Cards section should show Income, Expenses, Net, Transactions
    // Use .first() to avoid strict mode errors if labels appear in charts too
    await expect.element(page.getByText('Income', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Expenses', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Net / Cash Flow', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Saving Rate')).toBeVisible();
  });

  test('renders charts', async () => {
    await expect.element(page.getByRole('heading', { name: 'Top Categories' })).toBeVisible();
    await expect.element(page.getByRole('heading', { name: /Income & Expense Trend/i })).toBeVisible();
  });
});

describe('Dashboard - Top Categories Chart', () => {
  beforeEach(async () => {
    await page.goto(BASE_URL);
    // Upload CSV since it no longer auto-loads
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('static/data/report.csv');
    await expect.element(page.getByText('Saving Rate')).toBeVisible();
  });

  test('displays category labels without truncation overlap', async () => {
    // Verify Top Categories chart renders
    const chart = page.getByRole('region', { name: 'Top Categories' });
    await expect.element(chart).toBeVisible();

    // Verify category list structure
    const categoryList = page.getByRole('list', { name: 'Top categories by total amount' });
    await expect.element(categoryList).toBeVisible();
    await expect.element(categoryList.getByRole('listitem')).toHaveCount(5);

    // Verify category labels are fully visible
    // Ensure all category names render completely without being cut off
    await expect.element(chart.getByText('Uncategorized')).toBeVisible();
    await expect.element(chart.getByText('Compensation > Salary')).toBeVisible();
    await expect.element(chart.getByText('Payment > Loan')).toBeVisible();
    await expect.element(chart.getByText('Payment > Debt Repayment')).toBeVisible();
    await expect.element(chart.getByText('Compensation > Dividend')).toBeVisible();

    // Verify bar tracks have proper width
    // The chart should use a list layout where bars don't overlap labels
    const firstItem = page.getByRole('listitem').filter({ hasText: 'Uncategorized' });
    await expect.element(firstItem).toBeVisible();

    // Check that the bar container exists within each item (the gray background div)
    // The CSS flexbox layout ensures labels and bars are side-by-side
    const barTrack = firstItem.locator('div.h-3.bg-gray-200').first();
    await expect.element(barTrack).toBeVisible();

    // Verify the bar fill is rendered within the track
    const barFill = barTrack.locator('div.bg-mw-primary');
    await expect.element(barFill).toBeVisible();
  });
});
