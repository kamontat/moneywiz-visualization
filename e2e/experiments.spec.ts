import { test, expect } from '@playwright/test'

import { generateSQLite } from './utils/sqlite-generator'

const uploadFixture = async (page: import('@playwright/test').Page) => {
	const buffer = generateSQLite({
		transactions: [
			{
				payee: 'Salary Dec',
				category: 'Salary',
				parentCategory: 'Compensation',
				date: new Date(Date.UTC(2025, 11, 5)),
				amount: 1800,
			},
			{
				payee: 'Rent Dec',
				category: 'Rent',
				parentCategory: 'Housing',
				date: new Date(Date.UTC(2025, 11, 10)),
				amount: -900,
			},
			{
				payee: 'Salary Jan',
				category: 'Salary',
				parentCategory: 'Compensation',
				date: new Date(Date.UTC(2026, 0, 5)),
				amount: 2200,
			},
			{
				payee: 'Groceries Jan',
				category: 'Groceries',
				parentCategory: 'Food',
				date: new Date(Date.UTC(2026, 0, 8)),
				amount: -700,
			},
			{
				payee: 'Refund Jan',
				category: 'Groceries',
				parentCategory: 'Food',
				date: new Date(Date.UTC(2026, 0, 12)),
				amount: 100,
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

	test('renders redesigned cash flow panels', async ({ page }) => {
		await uploadFixture(page)

		await page.getByRole('tab', { name: 'Cash Flow' }).click()

		for (const title of [
			'Cash Flow Snapshot',
			'Inflow vs Outflow Trend',
			'Monthly Flow Decomposition',
			'Category Drivers',
		]) {
			await expect(page.getByRole('heading', { name: title })).toBeVisible()
		}

		for (const oldTitle of [
			'1) Debt & Repayment',
			'2) Windfall',
			'3) Giveaway',
		]) {
			await expect(page.getByText(oldTitle, { exact: true })).toHaveCount(0)
		}
	})

	test('shows previous-period comparison after setting date range', async ({
		page,
	}) => {
		await uploadFixture(page)

		await page.getByRole('tab', { name: 'Cash Flow' }).click()
		await page.getByRole('button', { name: 'Date' }).click()

		await page.locator('#start-date').fill('2026-01-01')
		await page.locator('#end-date').fill('2026-01-31')

		await expect(page.getByText(/Baseline:/)).toBeVisible()
		await expect(page.getByText(/vs baseline:/)).toBeVisible()
		await expect(page.getByText('No baseline period data')).toHaveCount(0)
	})
})
