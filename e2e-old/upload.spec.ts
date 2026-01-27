import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const BASE_URL = 'http://localhost:4173';

describe('CSV Upload - MoneyWiz file', () => {
  beforeEach(async () => {
    await page.goto(BASE_URL);
  });

  test('uploads CSV file and updates dashboard', async () => {
    // Verify empty state on fresh load
    // Dashboard heading should be hidden when no data
    await expect.element(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();
    await expect.element(page.getByText('Welcome to MoneyWiz Report')).toBeVisible();

    // Upload CSV via hidden input
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('static/data/report.csv');

    // Verify dashboard updates with data
    // After upload, dashboard should show summary cards
    // Use first() to avoid ambiguity if labels appear elsewhere
    await expect.element(page.getByText('Income', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Expenses', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Net / Cash Flow', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Saving Rate')).toBeVisible();

    // Charts should be visible
    await expect.element(page.getByRole('heading', { name: 'Top Categories' })).toBeVisible();
    await expect.element(page.getByRole('heading', { name: /Income & Expense Trend/i })).toBeVisible();
  });

  test('clears uploaded CSV and resets to empty state', async () => {
    // Upload CSV file first
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('static/data/report.csv');

    // Verify upload was successful - preview should appear
    await expect.element(page.getByText('Saving Rate')).toBeVisible();

    // Clear button should be visible after upload
    const clearButton = page.getByRole('button', { name: 'Clear loaded CSV' });
    await expect.element(clearButton).toBeVisible();

    // Click clear button
    await page.getByRole('button', { name: 'Clear loaded CSV' }).click();

    // Verify data is cleared
    // Preview section should be gone
    await expect.element(page.getByText('Saving Rate')).not.toBeVisible();

    // Clear button should be hidden
    await expect.element(page.getByRole('button', { name: 'Clear loaded CSV' })).not.toBeVisible();

    // Dashboard should show empty state message
    await expect.element(page.getByText('Welcome to MoneyWiz Report')).toBeVisible();
  });
});
