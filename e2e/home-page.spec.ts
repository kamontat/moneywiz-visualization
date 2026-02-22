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

	test('paginates transactions after upload', async ({ page }) => {
		const records = Array.from({ length: 150 }, (_, index) => ({
			...defaultRecord,
			description: `Lunch ${index + 1}`,
			date: new Date(Date.UTC(2026, 0, (index % 28) + 1)),
			amount: -(index + 1),
		}))
		const buffer = generateSQLite({ transactions: records })

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(page.getByText(/Imported \d+ transactions/)).toBeVisible({
			timeout: 10000,
		})
		await page.getByRole('tab', { name: 'Transactions' }).click()

		await expect(page.getByText(/Page\s+1\s+of\s+15/i)).toBeVisible()
		await expect(
			page.getByText(/Showing\s*1\s*-\s*10\s*of\s*150\s*transactions/i)
		).toBeVisible()

		await page.getByRole('button', { name: 'Next page' }).click()

		await expect(page.getByText(/Page\s+2\s+of\s+15/i)).toBeVisible()
		await expect(
			page.getByText(/Showing\s*11\s*-\s*20\s*of\s*150\s*transactions/i)
		).toBeVisible()
	})
})
