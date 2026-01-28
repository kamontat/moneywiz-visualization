import { test, expect } from '@playwright/test';

test.describe('Layout', () => {
	test('renders header and main content', async ({ page }) => {
		await page.goto('/');

		// Header Title
		await expect(page.getByRole('link', { name: 'MoneyWiz Report' })).toBeVisible();

		// Upload Button
		await expect(page.getByRole('button', { name: 'Upload CSV' })).toBeVisible();

		// GitHub Link (icon)
		// Assuming the aria-label is accessible as 'GitHub Repository'
		const githubLink = page.getByRole('link', { name: 'GitHub Repository' });
		await expect(githubLink).toBeVisible();
		await expect(githubLink).toHaveAttribute('href', 'https://github.com/kamontat/moneywiz-visualization');

		// Main content (from +page.svelte)
		await expect(page.getByText('Welcome to MoneyWiz Report')).toBeVisible();
	});
});
