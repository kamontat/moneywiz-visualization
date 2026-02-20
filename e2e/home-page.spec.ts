import { test, expect } from '@playwright/test'

import { generateSQLite, defaultRecord } from './utils/sqlite-generator'

test.describe('Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders empty state initially', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()
		await expect(
			page.getByText('import your MoneyWiz SQLite database')
		).toBeVisible()
	})

	test('renders transaction table after uploading database', async ({
		page,
	}) => {
		const buffer = generateSQLite({ transactions: [defaultRecord] })

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })
		await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible()

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
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
