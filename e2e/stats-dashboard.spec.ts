import { test, expect } from '@playwright/test'

import { generateSQLite } from './utils/sqlite-generator'

test.describe('Stats dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders stats panels without numeric title prefixes', async ({
		page,
	}, testInfo) => {
		const buffer = generateSQLite({
			transactions: [
				{
					payee: 'Salary',
					category: 'Salary',
					parentCategory: 'Compensation',
					date: new Date(Date.UTC(2026, 0, 1)),
					amount: 3000,
				},
				{
					payee: 'Rent',
					category: 'Rent',
					parentCategory: 'Housing',
					date: new Date(Date.UTC(2026, 0, 2)),
					amount: -1200,
				},
				{
					payee: 'Groceries',
					category: 'Groceries',
					parentCategory: 'Food',
					date: new Date(Date.UTC(2026, 0, 3)),
					amount: -200,
				},
			],
		})

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

		await page.getByRole('tab', { name: 'Stats' }).click()

		for (const title of [
			'KPI Snapshot',
			'Period Comparison',
			'Money Flow Composition',
			'Concentration',
			'Risk & Stability',
			'Cadence & Hygiene',
		]) {
			await expect(page.getByText(title, { exact: true })).toBeVisible()
		}

		for (const oldTitle of [
			'1) KPI Snapshot',
			'2) Period Comparison',
			'3) Money Flow Composition',
			'4) Concentration',
			'5) Risk & Stability',
			'6) Cadence & Hygiene',
		]) {
			await expect(page.getByText(oldTitle, { exact: true })).toHaveCount(0)
		}

		const screenshotPath = testInfo.outputPath('stats-dashboard.png')
		await page.screenshot({ path: screenshotPath, fullPage: true })
		await testInfo.attach('stats-dashboard', {
			path: screenshotPath,
			contentType: 'image/png',
		})
	})
})
