import { test, expect } from '@playwright/test';

test.describe('Dashboard - Basic summaries', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Upload CSV since it no longer auto-loads
		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.setInputFiles('static/data/report.csv');
		// Wait for the filename heading to appear, indicating upload is complete
		await expect(page.getByRole('heading', { name: 'report.csv' })).toBeVisible();
	});

	test('renders heading and summary cards', async ({ page }) => {
		// Heading should now be the filename
		await expect(page.getByRole('heading', { name: 'report.csv' })).toBeVisible();

		// Cards section should show Income, Expenses, Net, Transactions
		// Use .first() to avoid strict mode errors if labels appear in charts too
		await expect(page.getByText('Income', { exact: true }).first()).toBeVisible();
		await expect(page.getByText('Expenses', { exact: true }).first()).toBeVisible();
		await expect(page.getByText('Net / Cash Flow', { exact: true }).first()).toBeVisible();
		await expect(page.getByText('Saving Rate')).toBeVisible();
	});

	test('renders charts', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Top Categories' })).toBeVisible();
		await expect(page.getByRole('heading', { name: /Income & Expense Trend/i })).toBeVisible();
	});
});

test.describe('Dashboard - Top Categories Chart', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Upload CSV since it no longer auto-loads
		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.setInputFiles('static/data/report.csv');
		await expect(page.getByText('Saving Rate')).toBeVisible();
	});

	test('displays category labels without truncation overlap', async ({ page }) => {
		// Verify Top Categories chart renders
		const chart = page.getByRole('region', { name: 'Top Categories' });
		await expect(chart).toBeVisible();

		// Verify category list structure
		const categoryList = page.getByRole('list', { name: 'Top categories by total amount' });
		await expect(categoryList).toBeVisible();
		await expect(categoryList.getByRole('listitem')).toHaveCount(5);

		// Verify category labels are fully visible
		// Ensure all category names render completely without being cut off
		await expect(chart.getByText('Uncategorized')).toBeVisible();
		await expect(chart.getByText('Compensation > Salary')).toBeVisible();
		await expect(chart.getByText('Payment > Loan')).toBeVisible();
		await expect(chart.getByText('Payment > Debt Repayment')).toBeVisible();
		await expect(chart.getByText('Compensation > Dividend')).toBeVisible();

		// Verify bar tracks have proper width
		// The chart should use a list layout where bars don't overlap labels
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Uncategorized' });
		await expect(firstItem).toBeVisible();

		// Check that the bar container exists within each item (the gray background div)
		// The CSS flexbox layout ensures labels and bars are side-by-side
		const barTrack = firstItem.locator('div.h-3.bg-gray-200').first();
		await expect(barTrack).toBeVisible();

		// Verify the bar fill is rendered within the track
		const barFill = barTrack.locator('div.bg-mw-primary');
		await expect(barFill).toBeVisible();
	});
});
