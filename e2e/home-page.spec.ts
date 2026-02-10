import { test, expect } from '@playwright/test'

import { generateCsv, defaultRecord } from './utils/csv-generator'

test.describe('Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders empty state initially', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()
		await expect(
			page.getByText('import your MoneyWiz CSV export')
		).toBeVisible()
	})

	test('renders transaction table after uploading csv', async ({ page }) => {
		const csvContent = generateCsv([defaultRecord])

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })
		await expect(page.getByRole('button', { name: 'Upload CSV' })).toBeVisible()

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
		await expect(page.getByText('Upload your data')).not.toBeVisible()
	})
})
