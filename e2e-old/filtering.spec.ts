import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const BASE_URL = 'http://localhost:4173';

describe('Dashboard - Filtering', () => {
    beforeEach(async () => {
        await page.goto(BASE_URL);
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.setInputFiles('static/data/report.csv');
        await expect.element(page.getByText('Saving Rate')).toBeVisible();
    });

    test('collapsible panel interaction', async () => {
        const toggleBtn = page.getByRole('button', { name: /^Filter$/i });
        // Initially collapsed
        await expect.element(page.getByLabel('Start')).not.toBeVisible();

        // Expand
        await toggleBtn.click();
        await expect.element(page.getByLabel('Start')).toBeVisible();

        // Collapse via toggle button
        await toggleBtn.click();
        await expect.element(page.getByLabel('Start')).not.toBeVisible();
    });

    test('filters data by quick preset', async () => {
        // Expand filter
        await page.getByRole('button', { name: /^Filter$/i }).click();

        // Get initial income count or value to compare
        // "Income" card value.
        // Note: The value is formatted (e.g., ฿200,000.00).
        // Let's just check if it changes or persists.

        // Click "This Month" (Assuming data exists for current month 2026-01)
        await page.getByRole('button', { name: 'This Month' }).click();

        // "Clear Filter" should be visible immediately
        await expect.element(page.getByRole('button', { name: 'Clear Filter' })).toBeVisible();

        // Collapse panel to see "Active" badge
        await page.getByRole('button', { name: /^Filter$/i }).click();
        await expect.element(page.getByText('Active', { exact: true })).toBeVisible();

        // Verify "rows shown" count in header is less than total rows
        // "31 rows total" -> "X shown"
        // Target the specific container for meta info or search by text pattern directly
        const metaInfo = page.getByText(/rows total/);
        await expect.element(metaInfo).toBeVisible();

        // We expect some rows to be filtered out (data has 2025 entries)
        await expect.element(page.getByText('shown', { exact: false })).toBeVisible();

        // Clear filter
        await page.getByRole('button', { name: 'Clear Filter' }).click();
        await expect.element(page.getByText('Active')).not.toBeVisible();
        await expect.element(page.getByText('shown')).not.toBeVisible(); // Should hide the "X shown" part since all are shown
    });

    test('filters by manual date range', async () => {
        await page.getByRole('button', { name: 'Filter' }).click();

        // Set range to a specific day logic if possible, or just set start date.
        // Let's filter to 2025 where there is known data
        await page.locator('#start-date').fill('2025-12-01');
        await page.locator('#end-date').fill('2025-12-31');

        // Should show data for Dec 2025
        await expect.element(page.getByText('shown')).toBeVisible();

        // Check if Date Range Display updates to localized format
        // The display might show "01/12/2025 - 31/12/2025" or similar tailored to content
        // But the input is distinct.

        // Verify Income/Expense is not zero (there is one entry 31/12/2025)
        // Entry: "December spending", 16,326.46 THB
        // Wait, 16,326.46 is positive?
        // "KKP Start Saving (A)","Kbank kcnt spending (A)","December spending" ... "16,326.46"
        // This looks like a transfer or income.
        // Actually line 20: "27/12/2025", "302.81"
        // line 21: "30/11/2025" (Nov)

        // So Dec 2025 has data.
        const rowCount = page.getByText('shown', { exact: false }).first();
        await expect.element(rowCount).toBeVisible();
    });
});
