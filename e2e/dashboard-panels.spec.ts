import { test, expect } from '@playwright/test'

import { generateCsv, defaultRecord } from './utils/csv-generator'

test.describe('Dashboard Panels', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		const csvContent = generateCsv([defaultRecord])
		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })
		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		// Wait for dashboard to appear
		await expect(page.locator('h1#dash-title')).toBeVisible()
	})

	test('displays information in panels', async ({ page }) => {
		// We know that IncomeExpenseRatioChart and IncomeExpenseBarChart are wrapped in DashboardPanel
		// which now uses Panel and has aria-labelledby.
		// And DashboardPanel adds 'hover:shadow-md'

		// Check for Ratio Panel
		const ratioPanel = page.locator('section[aria-labelledby="ratio-title"]')
		await expect(ratioPanel).toBeVisible()
		await expect(ratioPanel).toHaveClass(/bg-mw-surface/)
		await expect(ratioPanel).toHaveClass(/rounded-xl/)
		await expect(ratioPanel).toHaveClass(/shadow-sm/)
		await expect(ratioPanel).toHaveClass(/hover:shadow-md/)

		// Check for Trend Panel
		const trendPanel = page.locator('section[aria-labelledby="trend-title"]')
		await expect(trendPanel).toBeVisible()
		await expect(trendPanel).toHaveClass(/bg-mw-surface/)
		await expect(trendPanel).toHaveClass(/hover:shadow-md/)
	})
})
