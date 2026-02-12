import { test, expect } from '@playwright/test'

test.describe('Storage page', () => {
	test('header storage link navigates to storage page', async ({ page }) => {
		await page.goto('/')

		const storageLink = page.getByRole('link', {
			name: 'Open storage usage page',
		})
		await expect(storageLink).toBeVisible()

		await storageLink.click()
		await expect(page).toHaveURL(/\/storage$/)
		await expect(
			page.getByRole('heading', { name: 'Browser Storage Usage' })
		).toBeVisible()
	})

	test('storage page shows estimate data or unsupported alert', async ({
		page,
	}, testInfo) => {
		await page.goto('/storage')
		await expect(
			page.getByRole('heading', { name: 'Browser Storage Usage' })
		).toBeVisible()

		const unsupportedAlert = page.getByText(
			/navigator\.storage\.estimate\(\) is not supported/i
		)
		const unsupportedVisible = await unsupportedAlert
			.isVisible()
			.catch(() => false)

		if (unsupportedVisible) {
			await expect(unsupportedAlert).toBeVisible()
			await page.screenshot({
				path: testInfo.outputPath('storage-unsupported.png'),
				fullPage: true,
			})
			return
		}

		await expect(page.getByText('Storage Fill Level')).toBeVisible()
		await expect(
			page.getByText('Usage Breakdown by Storage Type')
		).toBeVisible()
		await expect(page.locator('progress').first()).toBeVisible()

		await page.screenshot({
			path: testInfo.outputPath('storage-usage.png'),
			fullPage: true,
		})
	})
})
