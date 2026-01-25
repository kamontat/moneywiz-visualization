import { expect, test } from '@playwright/test';

test('home page has header', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('MoneyWiz Report')).toBeVisible();
});
