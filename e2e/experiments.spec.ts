import { test, expect } from '@playwright/test'

import { generateCsv } from './utils/csv-generator'

test.describe('Experiments tab', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders all experiment panels and updates target input', async ({
		page,
	}) => {
		const csvContent = generateCsv([
			{
				Payee: 'Salary',
				Category: 'Compensation > Salary',
				Date: '01/01/2026',
				Amount: '2000.00',
			},
			{
				Payee: 'Groceries',
				Category: 'Food > Groceries',
				Date: '01/03/2026',
				Amount: '-150.00',
			},
			{
				Payee: 'Refund',
				Category: 'Food > Groceries',
				Date: '01/04/2026',
				Amount: '30.00',
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

		await page.getByRole('tab', { name: 'Experiments' }).click()

		for (const title of [
			'1) Cashflow Sankey',
			'2) Monthly Waterfall',
			'3) Calendar Heatmap',
			'4) Category Volatility',
			'5) Category Bubble',
			'6) Savings vs Target',
			'7) Treemap Hierarchy',
			'8) Refund Impact',
			'9) Regime Timeline',
			'10) Outlier Timeline',
		]) {
			await expect(page.getByText(title)).toBeVisible()
		}

		await expect(page.locator('canvas').first()).toBeVisible()

		const input = page.locator('input[type="number"]').first()
		await input.fill('999')
		await expect(input).toHaveValue('999')
	})
})
