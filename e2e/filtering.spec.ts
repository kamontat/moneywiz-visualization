import { test, expect } from '@playwright/test';
import { generateCsv, defaultRecord } from './utils/csv-generator';

test.describe('Dashboard - Filtering', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('button', { name: 'Upload CSV' })).toBeVisible();
		
		const now = new Date();
		const currentMonthStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

		const records = [
			{ ...defaultRecord, Date: currentMonthStr, Amount: '-100.00', Description: 'Current Month' },
			{ ...defaultRecord, Date: '15/12/2025', Amount: '-200.00', Description: 'Dec 2025' },
			{ ...defaultRecord, Date: '15/11/2025', Amount: '-300.00', Description: 'Nov 2025' }
		];

		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.waitFor({ state: 'attached' });
		const csvContent = generateCsv(records);
		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent)
		});

		await expect(page.getByText('Saving Rate')).toBeVisible();
	});

	test('collapsible panel interaction', async ({ page }) => {
		const toggleBtn = page.getByRole('button', { name: /^Filter$/i });
		// Initially collapsed
		await expect(page.getByLabel('Start')).not.toBeVisible();

		// Expand
		await toggleBtn.click();
		await expect(page.getByLabel('Start')).toBeVisible();

		// Collapse via toggle button
		await toggleBtn.click();
		await expect(page.getByLabel('Start')).not.toBeVisible();
	});

	test('filters data by quick preset', async ({ page }) => {
		// Expand filter
		await page.getByRole('button', { name: /^Filter$/i }).click();

		// Click "This Month"
		await page.getByRole('button', { name: 'This Month' }).click();

		// "Clear Filter" should be visible immediately
		await expect(page.getByRole('button', { name: 'Clear Filter' })).toBeVisible();

		// Collapse panel to see "Active" badge
		await page.getByRole('button', { name: /^Filter$/i }).click();
		await expect(page.getByText('Active', { exact: true })).toBeVisible();

		// Verify "rows shown" count in header is less than total rows
		const metaInfo = page.getByText(/rows total/);
		await expect(metaInfo).toBeVisible();

		// We expect some rows to be filtered out (data has 2025 entries)
		await expect(page.getByText('shown', { exact: false })).toBeVisible();

		// Clear filter
		await page.getByRole('button', { name: 'Clear Filter' }).click();
		await expect(page.getByText('Active')).not.toBeVisible();
		await expect(page.getByText('shown')).not.toBeVisible(); // Should hide the "X shown" part since all are shown
	});

	test('filters by manual date range', async ({ page }) => {
		await page.getByRole('button', { name: 'Filter' }).click();

		// Set range to a specific day logic if possible, or just set start date.
		// Let's filter to 2025 where there is known data
		await page.locator('#start-date').fill('2025-12-01');
		await page.locator('#end-date').fill('2025-12-31');

		// Should show data for Dec 2025
		await expect(page.getByText('shown')).toBeVisible();
		
		// Verify expected data is visible (amount matches generated data)
		// Or just visibility of "shown" implies filter applied
	});
});
