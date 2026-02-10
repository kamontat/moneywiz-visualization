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
			'1) Monthly Waterfall',
			'2) Calendar Heatmap',
			'3) Category Volatility',
			'4) Category Bubble',
			'5) Savings vs Target',
			'6) Refund Impact',
			'7) Regime Timeline',
			'8) Outlier Timeline',
		]) {
			await expect(page.getByText(title)).toBeVisible()
		}

		await expect(page.locator('canvas').first()).toBeVisible()

		const input = page.locator('input[type="number"]').first()
		await input.fill('999')
		await expect(input).toHaveValue('999')
	})
})
