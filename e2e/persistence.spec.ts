import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('CSV Persistence', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('persists uploaded CSV data across page reloads', async ({ page }) => {
		const filePath = path.join(process.cwd(), 'static/data/report.csv');

		await test.step('Upload CSV', async () => {
			const fileInput = page.locator('input[type="file"]').first();
			await fileInput.setInputFiles(filePath);
			// Check for elements that only appear when data is loaded
			await expect(page.getByText('Saving Rate')).toBeVisible();
		});

		await test.step('Reload page and verify persistence', async () => {
			await page.reload();
			// Data should still be there immediately after load
			await expect(page.getByText('Saving Rate')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Clear loaded CSV' })).toBeVisible();
		});

		await test.step('Clear data and reload', async () => {
			await page.getByRole('button', { name: 'Clear loaded CSV' }).click();
			await expect(page.getByText('Saving Rate')).not.toBeVisible();

			await page.reload();
			// Data should remain cleared
			await expect(page.getByText('Saving Rate')).not.toBeVisible();
            await expect(page.getByText('Welcome to MoneyWiz Report')).toBeVisible();
		});
	});
});
