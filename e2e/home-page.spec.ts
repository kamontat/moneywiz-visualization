import { test, expect } from '@playwright/test';
import { generateCsv, defaultRecord } from './utils/csv-generator';

test.describe('Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('renders a blank canvas initially', async ({ page }) => {
		const canvas = page.locator('.blank-canvas').first();
		await expect(canvas).toBeVisible();

		const dashboardHeading = page.locator('h1#dash-title');
		await expect(dashboardHeading).not.toBeVisible();
	});

	test('renders dashboard after uploading csv', async ({ page }) => {
		const csvContent = generateCsv([defaultRecord]);

		// Use consistent upload method
		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.waitFor({ state: 'attached' });
		await expect(page.getByRole('button', { name: 'Upload CSV' })).toBeVisible();

		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		});

		// Check for dashboard
		await expect(page.locator('h1#dash-title')).toBeVisible();
		// The welcome message should be gone
		await expect(page.getByText('Welcome to MoneyWiz Report')).not.toBeVisible();
	});
});
