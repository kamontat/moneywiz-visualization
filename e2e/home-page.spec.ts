import { test, expect } from '@playwright/test'

import { generateCsv, defaultRecord } from './utils/csv-generator'

test.describe('Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders empty state initially', async ({ page }) => {
		await expect(page.getByText('No transactions loaded')).toBeVisible()
		await expect(
			page.getByText('Upload a MoneyWiz CSV file to get started')
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
		await expect(page.locator('table')).toBeVisible()
		await expect(page.getByText('Total transactions:')).toBeVisible()
		await expect(page.getByText('No transactions loaded')).not.toBeVisible()
	})
})
