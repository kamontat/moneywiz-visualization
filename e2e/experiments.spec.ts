import { test, expect } from '@playwright/test'

import { generateCsv } from './utils/csv-generator'

test.describe('Experiments tab', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders all experiment panels and updates target input', async ({
		page,
	}) => {
		test.setTimeout(120000)

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

		const [fileChooser] = await Promise.all([
			page.waitForEvent('filechooser'),
			page.getByRole('button', { name: 'Upload CSV' }).click(),
		])
		await fileChooser.setFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible({
			timeout: 60000,
		})

		await page.getByRole('tab', { name: 'Experiments' }).click()

		for (const title of [
			'1) Calendar Heatmap',
			'2) Category Volatility',
			'3) Category Bubble',
			'4) Savings vs Target',
			'5) Refund Impact',
			'6) Regime Timeline',
			'7) Outlier Timeline',
		]) {
			await expect(page.getByText(title)).toBeVisible()
		}

		await expect(page.locator('canvas').first()).toBeVisible()

		const input = page.locator('input[type="number"]').first()
		await input.fill('999')
		await expect(input).toHaveValue('999')
	})
})
