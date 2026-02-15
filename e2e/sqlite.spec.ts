import { test, expect } from '@playwright/test'

import { generateSQLite } from './utils/sqlite-generator'

test.describe('SQLite Experiment page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/sqlite')
	})

	test('loads sqlite data and renders paged JSON', async ({ page }) => {
		test.setTimeout(120000)
		const sqliteBuffer = await generateSQLite({ transactions: 205 })
		const transactionsPreview = page.locator('pre', {
			hasText: '"section": "transactions"',
		})
		const accountsPreview = page.locator('pre', {
			hasText: '"section": "accounts"',
		})

		const fileInput = page.locator('input[type="file"]').last()
		await fileInput.waitFor({ state: 'attached' })
		await fileInput.setInputFiles({
			name: 'fixture.sqlite',
			mimeType: 'application/vnd.sqlite3',
			buffer: sqliteBuffer,
		})

		await expect(transactionsPreview).toContainText(
			'"section": "transactions"'
		)
		await expect(transactionsPreview).toContainText('"page": 1')
		await expect(transactionsPreview).toContainText(
			'"description": "Lunch 205"'
		)

		await page.getByRole('button', { name: 'Next' }).click()
		await expect(transactionsPreview).toContainText('"page": 2')

		await page.getByText('Accounts').first().click()
		await expect(accountsPreview).toContainText(
			'"section": "accounts"'
		)
		await expect(accountsPreview).toContainText(
			'"name": "Wallet A"'
		)

		await page.screenshot({
			path: 'test-results/sqlite-page-validation.png',
			fullPage: true,
		})
	})
})
