import { test, expect } from '@playwright/test';
import { generateCsv, defaultRecord } from './utils/csv-generator';

test.describe('CSV Persistence', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('button', { name: 'Upload CSV' })).toBeVisible();
	});

	test('persists uploaded CSV data across page reloads', async ({ page }) => {
		// Upload CSV
		const fileInput = page.locator('input[type="file"]').first();
		const csvContent = generateCsv([defaultRecord]);
		
		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent)
		});
		
		// Check for elements that only appear when data is loaded
		await expect(page.getByRole('heading', { name: 'report.csv' })).toBeVisible();
		await expect(page.getByText('Saving Rate')).toBeVisible();

		// Reload page and verify persistence
		await page.reload();
		// Data should still be there immediately after load
		await expect(page.getByText('Saving Rate')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Clear loaded CSV' })).toBeVisible();

		// Clear data and reload
		await page.getByRole('button', { name: 'Clear loaded CSV' }).click();
		await expect(page.getByText('Saving Rate')).not.toBeVisible();

		await page.reload();
		// Data should remain cleared
		await expect(page.getByText('Saving Rate')).not.toBeVisible();
		await expect(page.getByText('Welcome to MoneyWiz Report')).toBeVisible();
	});
});
