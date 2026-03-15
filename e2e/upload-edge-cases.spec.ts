import type { MoneyWizRecord } from './utils/sqlite-generator'
import { test, expect } from '@playwright/test'

import { generateSQLite, defaultRecord } from './utils/sqlite-generator'

test.describe('Database Upload - Edge Cases', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test.describe('Large File Upload (Stress Test)', () => {
		test('uploads SQLite with 1000 transactions successfully', async ({
			page,
		}) => {
			const transactions: MoneyWizRecord[] = Array.from(
				{ length: 1000 },
				(_, i) => ({
					...defaultRecord,
					description: `Transaction ${i + 1}`,
					date: new Date(Date.UTC(2026, 0, (i % 31) + 1)),
					amount: -(i % 1000) - 100,
				})
			)

			const buffer = generateSQLite({ transactions })

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'large-report.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer,
			})

			await expect(page.getByText(/Imported 1,000 transactions/)).toBeVisible({
				timeout: 15000,
			})

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
			await expect(page.getByText(/Showing/i)).toBeVisible()
		})

		test('uploads SQLite with 5000 transactions successfully', async ({
			page,
		}) => {
			const transactions: MoneyWizRecord[] = Array.from(
				{ length: 5000 },
				(_, i) => ({
					...defaultRecord,
					description: `Transaction ${i + 1}`,
					date: new Date(
						Date.UTC(2025 + Math.floor(i / 365), i % 12, (i % 28) + 1)
					),
					amount: -(i % 5000) - 100,
					payee: `Payee ${i % 50}`,
					category: `Category ${i % 20}`,
				})
			)

			const buffer = generateSQLite({ transactions })

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'very-large-report.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer,
			})

			await expect(page.getByText(/Imported 5,000 transactions/)).toBeVisible({
				timeout: 30000,
			})

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
			await expect(page.getByText(/Showing/i)).toBeVisible()
		})
	})

	test.describe('Re-upload Behavior', () => {
		test('clear and re-upload different data', async ({ page }) => {
			const firstBuffer = generateSQLite({
				transactions: [
					{
						...defaultRecord,
						payee: 'First Upload Payee',
						description: 'First Upload',
						amount: -100,
					},
				],
			})

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'first-upload.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer: firstBuffer,
			})

			await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()

			const clearButton = page.getByRole('button', {
				name: 'Clear loaded database',
			})
			await expect(clearButton).toBeVisible()
			await clearButton.click()
			await expect(
				page.getByText('Database cleared successfully')
			).toBeVisible()

			const secondBuffer = generateSQLite({
				transactions: [
					{
						...defaultRecord,
						payee: 'Second Upload Payee',
						description: 'Second Upload',
						amount: -200,
					},
					{
						...defaultRecord,
						payee: 'Third Upload Payee',
						description: 'Third Upload',
						amount: -300,
					},
				],
			})

			const fileInput2 = page.locator('input[type="file"]').first()
			await fileInput2.waitFor({ state: 'attached' })

			await fileInput2.setInputFiles({
				name: 'second-upload.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer: secondBuffer,
			})

			await expect(page.getByText(/Imported 2 transactions/)).toBeVisible()
			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})

		test('clear and upload larger database after smaller one', async ({
			page,
		}) => {
			const smallBuffer = generateSQLite({
				transactions: [defaultRecord],
			})

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'small-db.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer: smallBuffer,
			})

			await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()

			const clearButton = page.getByRole('button', {
				name: 'Clear loaded database',
			})
			await expect(clearButton).toBeVisible()
			await clearButton.click()
			await expect(
				page.getByText('Database cleared successfully')
			).toBeVisible()

			const largeTransactions: MoneyWizRecord[] = Array.from(
				{ length: 500 },
				(_, i) => ({
					...defaultRecord,
					description: `Large Transaction ${i + 1}`,
					amount: -(i % 500) - 100,
				})
			)

			const largeBuffer = generateSQLite({
				transactions: largeTransactions,
			})

			const fileInput2 = page.locator('input[type="file"]').first()
			await fileInput2.waitFor({ state: 'attached' })

			await fileInput2.setInputFiles({
				name: 'large-db.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer: largeBuffer,
			})

			await expect(page.getByText(/Imported 500 transactions/)).toBeVisible({
				timeout: 15000,
			})

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})

		test('clear and upload smaller database after larger one', async ({
			page,
		}) => {
			const largeTransactions: MoneyWizRecord[] = Array.from(
				{ length: 500 },
				(_, i) => ({
					...defaultRecord,
					description: `Large Transaction ${i + 1}`,
					amount: -(i % 500) - 100,
				})
			)

			const largeBuffer = generateSQLite({
				transactions: largeTransactions,
			})

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'large-first.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer: largeBuffer,
			})

			await expect(page.getByText(/Imported 500 transactions/)).toBeVisible({
				timeout: 15000,
			})

			const clearButton = page.getByRole('button', {
				name: 'Clear loaded database',
			})
			await expect(clearButton).toBeVisible()
			await clearButton.click()
			await expect(
				page.getByText('Database cleared successfully')
			).toBeVisible()

			const smallBuffer = generateSQLite({
				transactions: [defaultRecord],
			})

			const fileInput2 = page.locator('input[type="file"]').first()
			await fileInput2.waitFor({ state: 'attached' })

			await fileInput2.setInputFiles({
				name: 'small-second.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer: smallBuffer,
			})

			await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})
	})

	test.describe('Edge Scenarios', () => {
		test('uploads database with minimal data (single transaction)', async ({
			page,
		}) => {
			const buffer = generateSQLite({
				transactions: [defaultRecord],
			})

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'minimal.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer,
			})

			await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})

		test('uploads database with diverse transaction types', async ({
			page,
		}) => {
			const transactions: MoneyWizRecord[] = [
				{
					...defaultRecord,
					payee: 'Employer',
					category: 'Salary',
					description: 'Monthly Salary',
					amount: 50000,
					isIncome: true,
				},
				{
					...defaultRecord,
					payee: 'Grocery Store',
					category: 'Food',
					parentCategory: 'Food and Beverage',
					description: 'Weekly Groceries',
					amount: -2500,
				},
				{
					...defaultRecord,
					payee: 'Electronics Store',
					category: 'Electronics',
					description: 'New Laptop',
					amount: -45000,
				},
			]

			const buffer = generateSQLite({ transactions })

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'diverse.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer,
			})

			await expect(page.getByText(/Imported 3 transactions/)).toBeVisible()

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})

		test('uploads database with multiple currencies', async ({ page }) => {
			const transactions: MoneyWizRecord[] = [
				{
					...defaultRecord,
					payee: 'Local Shop',
					description: 'Thai Purchase',
					amount: -500,
					currency: 'THB',
				},
				{
					...defaultRecord,
					payee: 'US Store',
					description: 'USD Purchase',
					amount: -50,
					currency: 'USD',
				},
				{
					...defaultRecord,
					payee: 'EU Store',
					description: 'EUR Purchase',
					amount: -40,
					currency: 'EUR',
				},
			]

			const buffer = generateSQLite({ transactions })

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'multi-currency.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer,
			})

			await expect(page.getByText(/Imported 3 transactions/)).toBeVisible()

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})

		test('uploads database with date range spanning multiple years', async ({
			page,
		}) => {
			const transactions: MoneyWizRecord[] = [
				{
					...defaultRecord,
					description: '2024 Transaction',
					date: new Date(Date.UTC(2024, 0, 15)),
					amount: -100,
				},
				{
					...defaultRecord,
					description: '2025 Transaction',
					date: new Date(Date.UTC(2025, 5, 20)),
					amount: -200,
				},
				{
					...defaultRecord,
					description: '2026 Transaction',
					date: new Date(Date.UTC(2026, 11, 31)),
					amount: -300,
				},
			]

			const buffer = generateSQLite({ transactions })

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'multi-year.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer,
			})

			await expect(page.getByText(/Imported 3 transactions/)).toBeVisible()

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})

		test('uploads database with special characters in fields', async ({
			page,
		}) => {
			const transactions: MoneyWizRecord[] = [
				{
					...defaultRecord,
					payee: "Mike's Restaurant & Bar",
					category: 'Food & Drink',
					description: "Dinner at Mike's (50% off!)",
					amount: -500,
				},
				{
					...defaultRecord,
					payee: 'Store "Quotes" Test',
					category: 'Shopping',
					description: 'Item with "quotes" and \'apostrophes\'',
					amount: -300,
				},
			]

			const buffer = generateSQLite({ transactions })

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'special-chars.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer,
			})

			await expect(page.getByText(/Imported 2 transactions/)).toBeVisible()

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})
	})

	test.describe('Session persistence after upload', () => {
		test('upload persists after page reload', async ({ page }) => {
			const buffer = generateSQLite({
				transactions: [
					{
						...defaultRecord,
						description: 'Persistence Test',
						amount: -100,
					},
					{
						...defaultRecord,
						description: 'Second Transaction',
						amount: -200,
					},
				],
			})

			const fileInput = page.locator('input[type="file"]').first()
			await fileInput.waitFor({ state: 'attached' })

			await fileInput.setInputFiles({
				name: 'persistence-test.sqlite',
				mimeType: 'application/x-sqlite3',
				buffer,
			})

			await expect(page.getByText(/Imported 2 transactions/)).toBeVisible()

			await page.reload()

			await expect(
				page.getByRole('button', { name: 'Clear loaded database' })
			).toBeVisible()

			await page.getByRole('tab', { name: 'Transactions' }).click()
			await expect(page.locator('table')).toBeVisible()
		})
	})
})
