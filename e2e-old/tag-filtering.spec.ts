import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const BASE_URL = 'http://localhost:4173';

describe('Dashboard - Tag Filtering', () => {
    beforeEach(async () => {
        await page.goto(BASE_URL);
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.setInputFiles('static/data/report.csv');
        await expect.element(page.getByText('Saving Rate')).toBeVisible();
    });

    test('shows tag categories in filter panel', async () => {
        const filterBtn = page.getByRole('button', { name: /^Filter$/i });
        await filterBtn.click();

        await expect.element(page.getByText('Group', { exact: true })).toBeVisible();
        await expect.element(page.getByRole('button', { name: 'KcNt' })).toBeVisible();
    });

    test('filters by include mode', async () => {
        await page.getByRole('button', { name: /^Filter$/i }).click();

        // Select 'KcNt'
        await page.getByRole('button', { name: 'KcNt' }).click();

        // Close panel so the active badge shows on the toggle row
        await page.getByRole('button', { name: /^Filter$/i }).click();

        await expect.element(page.getByRole('button', { name: /Clear Filter/i })).toBeVisible();
        await expect.element(page.getByText('Active', { exact: true })).toBeVisible();
        await expect.element(page.getByText(/shown/)).toBeVisible();
    });

    test('filters by exclude mode', async () => {
        await page.getByRole('button', { name: /^Filter$/i }).click();

        // Pick the first Exclude toggle (Group category appears first in sorted list)
        await page.getByRole('button', { name: 'Exc' }).first().click();

        // Select 'KcNt'
        await page.getByRole('button', { name: 'KcNt' }).click();

        await page.getByRole('button', { name: /^Filter$/i }).click();
        await expect.element(page.getByText('Active')).toBeVisible();
    });

    test('clears tag filters', async () => {
        await page.getByRole('button', { name: /^Filter$/i }).click();
        await page.getByRole('button', { name: 'KcNt' }).click();

        await expect.element(page.getByText(/shown/)).toBeVisible();

        // Click Clear Tags
        await page.getByRole('button', { name: /Clear Tags/i }).click();

        // Should reset
        await expect.element(page.getByText(/shown/)).not.toBeVisible();
        await expect.element(page.getByRole('button', { name: /Clear Tags/i })).not.toBeVisible();
    });

    test('persists tag filters on reload', async () => {
        await page.getByRole('button', { name: /^Filter$/i }).click();
        await page.getByRole('button', { name: 'KcNt' }).click();

        // Wait for state to settle
        await expect.element(page.getByText(/shown/)).toBeVisible();

        await page.reload();

        // Wait for hydration
        await expect.element(page.getByText('Saving Rate')).toBeVisible();

        // Check persistence indicators
        await expect.element(page.getByText(/shown/)).toBeVisible();
        await expect.element(page.getByText('Active')).toBeVisible();
    });
});
