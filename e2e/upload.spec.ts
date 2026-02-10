import { test, expect } from '@playwright/test'

import { generateCsv, defaultRecord } from './utils/csv-generator'

test.describe('CSV Upload - MoneyWiz file', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('uploads CSV file and displays transactions', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const csvContent = generateCsv([defaultRecord])

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		await expect(page.getByText(/Imported \d+ transactions/)).toBeVisible({
			timeout: 10000,
		})
		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.locator('table')).toBeVisible()
		await expect(page.getByText(/Showing/i)).toBeVisible()
	})

	test('clears uploaded CSV and resets to empty state', async ({ page }) => {
		const csvContent = generateCsv([defaultRecord])

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		await expect(page.getByText(/Imported \d+ transactions/)).toBeVisible({
			timeout: 10000,
		})

		const clearButton = page.getByRole('button', { name: 'Clear loaded CSV' })
		await expect(clearButton).toBeVisible()

		await clearButton.click()

		await expect(page.getByText('CSV data cleared successfully')).toBeVisible({
			timeout: 5000,
		})
		await expect(
			page.getByRole('button', { name: 'Clear loaded CSV' })
		).not.toBeVisible()
	})
})
