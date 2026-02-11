import { test, expect } from '@playwright/test'

import { generateCsv } from './utils/csv-generator'

test.describe('Stats dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders stats panels without numeric title prefixes', async ({
		page,
	}, testInfo) => {
		const csvContent = generateCsv([
			{
				Payee: 'Salary',
				Category: 'Compensation > Salary',
				Date: '01/01/2026',
				Amount: '3000.00',
			},
			{
				Payee: 'Rent',
				Category: 'Housing > Rent',
				Date: '01/02/2026',
				Amount: '-1200.00',
			},
			{
				Payee: 'Groceries',
				Category: 'Food > Groceries',
				Date: '01/03/2026',
				Amount: '-200.00',
			},
		])

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
