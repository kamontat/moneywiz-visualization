import { test, expect } from '@playwright/test'

test('home page has header', async ({ page }) => {
	await page.goto('/')
	await expect(
		page.locator('header').getByText('MoneyWiz Report')
	).toBeVisible()
})
