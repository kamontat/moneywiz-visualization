import { test, expect } from '@playwright/test'

import { generateSQLite } from './utils/sqlite-generator'

test.describe('SQLite Experiment page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/sqlite')
	})

	test('loads sqlite data and renders paged JSON', async ({ page }, testInfo) => {
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

		await page.getByText('Transactions', { exact: true }).first().click()
		await expect(transactionsPreview).toContainText('"section": "transactions"')
		await expect(transactionsPreview).toContainText('"page": 1')
		await expect(transactionsPreview).toContainText(
			'"description": "Lunch 205"'
		)

		await page.getByRole('button', { name: 'Next' }).click()
		await expect(transactionsPreview).toContainText('"page": 2')

		await page.getByText('Accounts', { exact: true }).first().click()
		await expect(accountsPreview).toContainText('"section": "accounts"')
		await expect(accountsPreview).toContainText('"name": "Wallet A"')

		const screenshotPath = testInfo.outputPath('sqlite-page-validation.png')
		await page.screenshot({ path: screenshotPath, fullPage: true })
		await testInfo.attach('sqlite-page-validation', {
			path: screenshotPath,
			contentType: 'image/png',
		})
	})
})
