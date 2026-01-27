import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';
import path from 'path';

const BASE_URL = 'http://localhost:4173';

describe('CSV Persistence', () => {
	beforeEach(async () => {
		await page.goto(BASE_URL);
	});

	test('persists uploaded CSV data across page reloads', async () => {
		const filePath = path.join(process.cwd(), 'static/data/report.csv');

		// Upload CSV
		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.setInputFiles(filePath);
		// Check for elements that only appear when data is loaded
		await expect.element(page.getByText('Saving Rate')).toBeVisible();

		// Reload page and verify persistence
		await page.reload();
		// Data should still be there immediately after load
		await expect.element(page.getByText('Saving Rate')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Clear loaded CSV' })).toBeVisible();

		// Clear data and reload
		await page.getByRole('button', { name: 'Clear loaded CSV' }).click();
		await expect.element(page.getByText('Saving Rate')).not.toBeVisible();

		await page.reload();
		// Data should remain cleared
		await expect.element(page.getByText('Saving Rate')).not.toBeVisible();
		await expect.element(page.getByText('Welcome to MoneyWiz Report')).toBeVisible();
	});
});
