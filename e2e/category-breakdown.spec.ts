import { test, expect } from '@playwright/test'

import { generateCsv } from './utils/csv-generator'

test.describe('Dashboard - Category Breakdown', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await expect(page.getByRole('button', { name: 'Upload CSV' })).toBeVisible()
		const fileInput = page.locator('input[type="file"]').first()

		const csvContent = generateCsv([
			{ Category: 'Compensation > Salary', Amount: '50000.00', Description: 'Salary' },
			{ Category: 'Food and Beverage > Food', Amount: '-500.00', Description: 'Lunch' },
		])

		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		// Wait for dashboard to load by checking for the filename heading
		await expect(page.getByRole('heading', { name: 'report.csv' })).toBeVisible()
	})

	test('collapsible panels are visible and interactive', async ({ page }) => {
		const incomeBtn = page.getByRole('button', { name: /Income by Category/ })
		const expenseBtn = page.getByRole('button', { name: /Expenses by Category/ })

		await expect(incomeBtn).toBeVisible()
		await expect(expenseBtn).toBeVisible()

		// The panels should be collapsed, meaning the content divs are not in the DOM
		await expect(page.locator('#income-breakdown')).toHaveCount(0)
		await expect(page.locator('#expense-breakdown')).toHaveCount(0)

		// Expand income
		await incomeBtn.click()
		await expect(page.locator('#income-breakdown')).toBeVisible()
		await expect(page.locator('#income-breakdown').getByText('Compensation > Salary')).toBeVisible()

		// Expand expense
		await expenseBtn.click()
		await expect(page.locator('#expense-breakdown')).toBeVisible()
		await expect(
			page.locator('#expense-breakdown').getByText('Food and Beverage > Food')
		).toBeVisible()

		// Collapse items again
		await incomeBtn.click()
		await expect(page.locator('#income-breakdown')).toHaveCount(0)
	})
})
