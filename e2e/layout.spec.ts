import { test, expect } from '@playwright/test'

test.describe('Layout', () => {
	test('renders header and main content', async ({ page }) => {
		await page.goto('/')

		await expect(
			page.locator('header').getByText('MoneyWiz Report')
		).toBeVisible()
		await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible()

		const sourceLink = page.getByRole('link', {
			name: 'Go to source code repository',
		})
		await expect(sourceLink).toBeVisible()
		await expect(sourceLink).toHaveAttribute(
			'href',
			/github\.com\/kamontat\/moneywiz-visualization/
		)

		await expect(page.getByText('Upload your data')).toBeVisible()
	})
})
