import { expect, test } from '@playwright/test'

import { generateSQLite } from './utils/sqlite-generator'

const uploadFixture = async (page: import('@playwright/test').Page) => {
	const buffer = generateSQLite({
		transactions: [
			{
				payee: 'Salary',
				category: 'Salary',
				parentCategory: 'Compensation',
				date: new Date(Date.UTC(2026, 0, 1)),
				amount: 2500,
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
				amount: -400,
			},
			{
				payee: 'Coffee Shop',
				category: 'Coffee',
				parentCategory: 'Food',
				date: new Date(Date.UTC(2026, 0, 4)),
				amount: -120,
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

	await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()
}

test.describe('Drivers tab', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('shows concentration and payee insights in drivers view', async ({
		page,
	}) => {
		await uploadFixture(page)
		await page.getByRole('tab', { name: 'Drivers' }).click()

		for (const title of [
			'Income Mix',
			'Expense Mix',
			'Category Concentration',
			'Income Categories',
			'Expense Categories',
			'Payee Spend Insights',
			'Top Payees per Category',
		]) {
			await expect(page.getByRole('heading', { name: title })).toBeVisible()
		}

		await expect(page.getByText(/HHI\s+0\./)).toBeVisible()
		await expect(page.locator('canvas').first()).toBeVisible()
	})
})
