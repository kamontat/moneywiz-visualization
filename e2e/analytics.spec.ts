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
				amount: 2000,
			},
			{
				payee: 'Rent',
				category: 'Rent',
				parentCategory: 'Housing',
				date: new Date(Date.UTC(2026, 0, 5)),
				amount: -1000,
			},
			{
				payee: 'Salary',
				category: 'Salary',
				parentCategory: 'Compensation',
				date: new Date(Date.UTC(2026, 1, 1)),
				amount: 2100,
			},
			{
				payee: 'Groceries',
				category: 'Groceries',
				parentCategory: 'Food',
				date: new Date(Date.UTC(2026, 1, 8)),
				amount: -400,
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

test.describe('Overview tab', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('renders overview panels with snapshot and trend', async ({ page }) => {
		await uploadFixture(page)
		await page.getByRole('tab', { name: 'Overview' }).click()

		await expect(
			page.getByRole('heading', { name: 'Financial Snapshot' })
		).toBeVisible()
		await expect(
			page.getByRole('heading', { name: 'Net Worth Trend' })
		).toBeVisible()
		await expect(
			page.getByRole('heading', { name: 'Top Expense Drivers' })
		).toBeVisible()
		await expect(page.getByText('Total Income')).toBeVisible()
		await expect(page.getByText('Total Expenses')).toBeVisible()
		await expect(page.getByText('Net Flow')).toBeVisible()
		await expect(page.getByText('Current Net Worth')).toBeVisible()
		await expect(
			page.getByText('Monthly Change', { exact: true })
		).toBeVisible()
		await expect(page.getByText('Peak Net Worth')).toBeVisible()
		await expect(page.getByText('Avg Monthly Change')).toBeVisible()
		await expect(page.locator('canvas').first()).toBeVisible()
		await expect(
			page.getByRole('heading', { name: 'Monthly Waterfall' })
		).toHaveCount(0)
		await expect(
			page.getByRole('heading', { name: 'Income vs Expenses' })
		).toHaveCount(0)
		await expect(
			page.getByRole('heading', { name: 'Payee Spend Insights' })
		).toHaveCount(0)
	})

	test('shows overview empty state when filters remove all transactions', async ({
		page,
	}) => {
		await uploadFixture(page)
		await page.getByRole('tab', { name: 'Overview' }).click()
		await page.getByRole('button', { name: 'Date' }).click()

		await page.locator('#start-date').fill('2030-01-01')
		await page.locator('#end-date').fill('2030-01-31')

		await expect(
			page.getByText('No transactions to analyze. Upload a database file')
		).toBeVisible()
	})
})
