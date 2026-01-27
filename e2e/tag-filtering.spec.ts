import { test, expect } from '@playwright/test';

test.describe('Dashboard - Tag Filtering', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.setInputFiles('static/data/report.csv');
		await expect(page.getByText('Saving Rate')).toBeVisible();
	});

	test('shows tag categories in filter panel', async ({ page }) => {
		const filterBtn = page.getByRole('button', { name: /^Filter$/i });
		await filterBtn.click();

		await expect(page.getByText('Group', { exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'KcNt' })).toBeVisible();
	});

	test('filters by include mode', async ({ page }) => {
		await page.getByRole('button', { name: /^Filter$/i }).click();

		// Select 'KcNt'
		await page.getByRole('button', { name: 'KcNt' }).click();

		// Close panel so the active badge shows on the toggle row
		await page.getByRole('button', { name: /^Filter$/i }).click();

		await expect(page.getByRole('button', { name: /Clear Filter/i })).toBeVisible();
		await expect(page.getByText('Active', { exact: true })).toBeVisible();
		await expect(page.getByText(/shown/)).toBeVisible();
	});

	test('filters by exclude mode', async ({ page }) => {
		await page.getByRole('button', { name: /^Filter$/i }).click();

		// Pick the first Exclude toggle (Group category appears first in sorted list)
		await page.getByRole('button', { name: 'Exc' }).first().click();

		// Select 'KcNt'
		await page.getByRole('button', { name: 'KcNt' }).click();

		await page.getByRole('button', { name: /^Filter$/i }).click();
		await expect(page.getByText('Active')).toBeVisible();
	});

	test('clears tag filters', async ({ page }) => {
		await page.getByRole('button', { name: /^Filter$/i }).click();
		await page.getByRole('button', { name: 'KcNt' }).click();

		await expect(page.getByText(/shown/)).toBeVisible();

		// Click Clear Tags
		await page.getByRole('button', { name: /Clear Tags/i }).click();

		// Should reset
		await expect(page.getByText(/shown/)).not.toBeVisible();
		await expect(page.getByRole('button', { name: /Clear Tags/i })).not.toBeVisible();
	});

	test('persists tag filters on reload', async ({ page }) => {
		await page.getByRole('button', { name: /^Filter$/i }).click();
		await page.getByRole('button', { name: 'KcNt' }).click();

		// Wait for state to settle
		await expect(page.getByText(/shown/)).toBeVisible();

		await page.reload();

		// Wait for hydration
		await expect(page.getByText('Saving Rate')).toBeVisible();

		// Check persistence indicators
		await expect(page.getByText(/shown/)).toBeVisible();
		await expect(page.getByText('Active')).toBeVisible();
	});
});
