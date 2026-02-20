import { test, expect } from '@playwright/test'

import { generateSQLite } from './utils/sqlite-generator'

const uploadFixture = async (page: import('@playwright/test').Page) => {
	const buffer = generateSQLite({
		transactions: [
			{
				payee: 'Salary',
				category: 'Salary',
				parentCategory: 'Compensation',
				date: new Date(Date.UTC(2026, 0, 1)),
				amount: 2000,
			},
			{
				payee: 'Groceries',
				category: 'Groceries',
				parentCategory: 'Food',
				date: new Date(Date.UTC(2026, 0, 3)),
				amount: -150,
			},
			{
				payee: 'Refund',
				category: 'Groceries',
				parentCategory: 'Food',
				date: new Date(Date.UTC(2026, 0, 4)),
				amount: 30,
			},
		],
	})
	const [fileChooser] = await Promise.all([
		page.waitForEvent('filechooser'),
		page.getByRole('button', { name: 'Upload' }).click(),
	])
	await fileChooser.setFiles({
		name: 'report.sqlite',
		mimeType: 'application/x-sqlite3',
		buffer,
	})
	await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()
}

test.describe('Experiments tab', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders all experiment panels and updates target input', async ({
		page,
	}) => {
		await uploadFixture(page)

		await page.getByRole('tab', { name: 'Experiments' }).click()

		for (const title of [
			'1) Category Volatility',
			'2) Category Bubble',
			'3) Savings vs Target',
			'4) Refund Impact',
			'5) Regime Timeline',
			'6) Outlier Timeline',
		]) {
			await expect(page.getByText(title)).toBeVisible()
		}

		await expect(page.locator('canvas').first()).toBeVisible()

		const input = page.locator('input[type="number"]').first()
		await input.fill('999')
		await expect(input).toHaveValue('999')
	})
})

test.describe('Cash Flow tab', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders all cash flow panels', async ({ page }) => {
		await uploadFixture(page)

		await page.getByRole('tab', { name: 'Cash Flow' }).click()

		for (const title of ['1) Debt & Repayment', '2) Windfall', '3) Giveaway']) {
			await expect(page.getByText(title)).toBeVisible()
		}
	})
})
