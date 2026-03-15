import { test, expect } from '@playwright/test'

import { generateSQLite, defaultRecord } from './utils/sqlite-generator'

test.describe('Data Persistence - IndexedDB', () => {
	test('persists data across page reloads', async ({ page }) => {
		await page.goto('/')

		const buffer = generateSQLite({
			transactions: [
				{ ...defaultRecord, payee: 'Coffee Shop', amount: -50 },
				{ ...defaultRecord, payee: 'Salary', amount: 5000, isIncome: true },
			],
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(
			page.getByText(/Imported [\d,]+ transactions successfully/)
		).toBeVisible()

		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.locator('table')).toBeVisible()
		await expect(page.getByText('Coffee Shop')).toBeVisible()
		await expect(page.getByText('Salary')).toBeVisible()

		await page.reload()

		await expect(page.getByRole('tab', { name: 'Transactions' })).toBeVisible({
			timeout: 10000,
		})
		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.locator('table')).toBeVisible()
		await expect(page.getByText('Coffee Shop')).toBeVisible()
		await expect(page.getByText('Salary')).toBeVisible()
	})

	test('persists data across browser tab close and reopen', async ({
		context,
	}) => {
		const page1 = await context.newPage()
		await page1.goto('/')

		const buffer = generateSQLite({
			transactions: [
				{ ...defaultRecord, payee: 'Grocery Store', amount: -120 },
				{ ...defaultRecord, payee: 'Freelance Payment', amount: 3000 },
			],
		})

		const fileInput = page1.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(
			page1.getByText(/Imported [\d,]+ transactions successfully/)
		).toBeVisible({ timeout: 10000 })

		await page1.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page1.getByText('Grocery Store')).toBeVisible()
		await expect(page1.getByText('Freelance Payment')).toBeVisible()

		await page1.close()

		const page2 = await context.newPage()
		await page2.goto('/')

		await expect(page2.getByRole('tab', { name: 'Transactions' })).toBeVisible({
			timeout: 10000,
		})
		await page2.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page2.locator('table')).toBeVisible()
		await expect(page2.getByText('Grocery Store')).toBeVisible()
		await expect(page2.getByText('Freelance Payment')).toBeVisible()

		await page2.close()
	})

	test('clears data when clear button is clicked', async ({ page }) => {
		await page.goto('/')

		const buffer = generateSQLite({
			transactions: [{ ...defaultRecord, payee: 'Test Payee 1', amount: -100 }],
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(
			page.getByText(/Imported [\d,]+ transactions successfully/)
		).toBeVisible()

		const clearButton = page.getByRole('button', {
			name: 'Clear loaded database',
		})
		await expect(clearButton).toBeVisible()

		await clearButton.click()

		await expect(page.getByText('Database cleared successfully')).toBeVisible({
			timeout: 5000,
		})
		await expect(
			page.getByRole('button', { name: 'Clear loaded database' })
		).not.toBeVisible()

		await page.reload()

		await expect(page.getByText('Upload your data')).toBeVisible()
		await expect(
			page.getByRole('button', { name: 'Clear loaded database' })
		).not.toBeVisible()
	})

	test('handles multiple upload-clear cycles', async ({ page }) => {
		await page.goto('/')

		const buffer1 = generateSQLite({
			transactions: [{ ...defaultRecord, payee: 'First Upload', amount: -50 }],
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report1.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: buffer1,
		})

		await expect(
			page.getByText(/Imported [\d,]+ transactions successfully/)
		).toBeVisible()

		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.getByText('First Upload')).toBeVisible()

		const clearButton = page.getByRole('button', {
			name: 'Clear loaded database',
		})
		await clearButton.click()

		await expect(page.getByText('Database cleared successfully')).toBeVisible({
			timeout: 5000,
		})

		const buffer2 = generateSQLite({
			transactions: [{ ...defaultRecord, payee: 'Second Upload', amount: -75 }],
		})

		const fileInput2 = page.locator('input[type="file"]').first()
		await fileInput2.waitFor({ state: 'attached' })

		await fileInput2.setInputFiles({
			name: 'report2.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: buffer2,
		})

		await expect(
			page.getByText(/Imported [\d,]+ transactions successfully/)
		).toBeVisible()

		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.getByText('Second Upload')).toBeVisible()
		await expect(page.getByText('First Upload')).not.toBeVisible()
	})

	test('persists data after navigation to storage page', async ({ page }) => {
		await page.goto('/')

		const buffer = generateSQLite({
			transactions: [
				{ ...defaultRecord, payee: 'Navigation Test', amount: -200 },
			],
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(
			page.getByText(/Imported [\d,]+ transactions successfully/)
		).toBeVisible()

		await page.goto('/storage')
		await expect(page.getByText('Browser Storage Usage')).toBeVisible()

		await page.goto('/')

		await expect(page.locator('table')).toBeVisible()
		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.getByText('Navigation Test')).toBeVisible()
	})

	test('storage page shows data after upload', async ({ page }) => {
		await page.goto('/')

		const buffer = generateSQLite({
			transactions: [
				{ ...defaultRecord, payee: 'Storage Page Test', amount: -150 },
			],
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(
			page.getByText(/Imported [\d,]+ transactions successfully/)
		).toBeVisible()

		await page.goto('/storage')

		await expect(page.getByText('Browser Storage Usage')).toBeVisible()

		const usedStat = page.getByText(/Used/).first()
		await expect(usedStat).toBeVisible()
	})

	test('storage reset clears all data including persisted transactions', async ({
		page,
	}) => {
		await page.goto('/')

		const buffer = generateSQLite({
			transactions: [
				{ ...defaultRecord, payee: 'Reset Test Payee', amount: -300 },
			],
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(
			page.getByText(/Imported [\d,]+ transactions successfully/)
		).toBeVisible()

		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.getByText('Reset Test Payee')).toBeVisible()

		await page.goto('/storage')

		const resetButton = page.getByRole('button', { name: 'Reset All Data' })
		await resetButton.click()

		const confirmButton = page.getByRole('button', {
			name: 'Yes, Reset Everything',
		})
		await expect(confirmButton).toBeVisible()
		await confirmButton.click()

		await expect(
			page.getByText('All browser storage data has been cleared. Reloading page...')
		).toBeVisible({ timeout: 5000 })

		await page.goto('/')

		await expect(page.getByText('Upload your data')).toBeVisible({
			timeout: 10000,
		})
		await expect(page.getByText('Reset Test Payee')).not.toBeVisible()
	})

	test('handles empty database upload and clear', async ({ page }) => {
		await page.goto('/')

		const buffer = generateSQLite({ transactions: [] })

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'empty.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(
			page.getByText(/Imported 0 transactions successfully/)
		).toBeVisible()

		const clearButton = page.getByRole('button', {
			name: 'Clear loaded database',
		})
		await expect(clearButton).toBeVisible()

		await clearButton.click()

		await expect(page.getByText('Database cleared successfully')).toBeVisible({
			timeout: 5000,
		})
	})
})
