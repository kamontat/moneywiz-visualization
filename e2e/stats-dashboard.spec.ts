import { test, expect } from '@playwright/test'

import { generateSQLite } from './utils/sqlite-generator'

test.describe('Risk dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders risk panels without legacy sections', async ({
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

		await page.getByRole('tab', { name: 'Risk' }).click()

		for (const title of [
			'Money Flow Composition',
			'Risk and Stability',
			'Cadence and Data Quality',
		]) {
			await expect(page.getByText(title, { exact: true })).toBeVisible()
		}

		await expect(
			page.getByText('Daily net-flow intensity calendar.')
		).toBeVisible()
		await expect(page.getByText('KPI Snapshot', { exact: true })).toHaveCount(0)
		await expect(
			page.getByText('Period Comparison', { exact: true })
		).toHaveCount(0)
		await expect(page.getByText('Concentration', { exact: true })).toHaveCount(
			0
		)
		await expect(
			page.getByText('Risk & Stability', { exact: true })
		).toHaveCount(0)
		await expect(
			page.getByText('Cadence & Hygiene', { exact: true })
		).toHaveCount(0)

		const screenshotPath = testInfo.outputPath('stats-dashboard.png')
		await page.screenshot({ path: screenshotPath, fullPage: true })
		await testInfo.attach('stats-dashboard', {
			path: screenshotPath,
			contentType: 'image/png',
		})
	})
})
