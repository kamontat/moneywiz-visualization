import { test, expect } from '@playwright/test'

import { generateSQLite } from './utils/sqlite-generator'

test.describe('SQLite Experiment page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/sqlite')
	})

	test('loads sqlite data and renders paged JSON', async ({ page }) => {
		test.setTimeout(120000)
		const sqliteBuffer = await generateSQLite({ transactions: 205 })

		const fileInput = page.locator('input[type="file"]').last()
		await fileInput.waitFor({ state: 'attached' })
		await fileInput.setInputFiles({
			name: 'fixture.sqlite',
			mimeType: 'application/vnd.sqlite3',
			buffer: sqliteBuffer,
		})

		await expect(page.getByText(/Page 1 of 2 \(205 rows\)/)).toBeVisible({
			timeout: 60000,
		})
		await expect(page.locator('pre')).toContainText('"section": "transactions"')
		await expect(page.locator('pre')).toContainText(
			'"description": "Lunch 205"'
		)

		await page.getByRole('button', { name: 'Next' }).click()
		await expect(page.getByText(/Page 2 of 2 \(205 rows\)/)).toBeVisible({
			timeout: 60000,
		})

		await page.selectOption('#sqlite-section', 'accounts')
		await expect(page.getByText(/Page 1 of 1 \(1 rows\)/)).toBeVisible({
			timeout: 60000,
		})
		await expect(page.locator('pre')).toContainText('"section": "accounts"')
		await expect(page.locator('pre')).toContainText('"name": "Wallet A"')

		await page.screenshot({
			path: 'test-results/sqlite-page-validation.png',
			fullPage: true,
		})
	})
})
