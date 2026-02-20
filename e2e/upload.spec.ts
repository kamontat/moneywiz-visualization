import { test, expect } from '@playwright/test'

import { generateSQLite, defaultRecord } from './utils/sqlite-generator'

test.describe('Database Upload - MoneyWiz file', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('uploads SQLite file and displays transactions', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const buffer = generateSQLite({ transactions: [defaultRecord] })

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()
		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.locator('table')).toBeVisible()
		await expect(page.getByText(/Showing/i)).toBeVisible()
	})

	test('does not throw category scale console error on upload', async ({
		page,
	}) => {
		const runtimeErrors: string[] = []
		const buffer = generateSQLite({ transactions: [defaultRecord] })

		page.on('console', (message) => {
			if (message.type() === 'error') {
				runtimeErrors.push(message.text())
			}
		})
		page.on('pageerror', (error) => {
			runtimeErrors.push(error.message)
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })
		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()

		const allErrors = runtimeErrors.join('\n')
		expect(allErrors).not.toContain('category" is not a registered scale')
		expect(allErrors).not.toContain('category is not a registered scale')
	})

	test('clears uploaded database and resets to empty state', async ({
		page,
	}) => {
		const buffer = generateSQLite({ transactions: [defaultRecord] })

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()

		const clearButton = page.getByRole('button', {
			name: 'Clear loaded database',
		})
		await expect(clearButton).toBeVisible()

		await clearButton.click()

		await expect(page.getByText('Database cleared successfully')).toBeVisible({
			timeout: 5000,
		})
		await expect(
			page.getByRole('button', { name: 'Clear loaded database' })
		).not.toBeVisible()
	})
})
