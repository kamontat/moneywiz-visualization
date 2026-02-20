import { test, expect } from '@playwright/test'

import { generateSQLite, type MoneyWizRecord } from './utils/sqlite-generator'

test.describe('Filter Persistence', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173')
		// Wait for the page to load completely
		await page.waitForLoadState('networkidle')
	})

	test('should show available payees and accounts after page refresh with data', async ({
		page,
	}) => {
		// Generate test data with multiple payees and accounts
		const testData: MoneyWizRecord[] = [
			{
				payee: 'Coffee Shop',
				category: 'Food',
				parentCategory: 'Food and Beverage',
				description: 'Morning coffee',
				date: new Date(Date.UTC(2026, 0, 1)),
				amount: -50,
				currency: 'THB',
			},
			{
				payee: 'Supermarket',
				category: 'Groceries',
				parentCategory: 'Food and Beverage',
				description: 'Weekly shopping',
				date: new Date(Date.UTC(2026, 0, 2)),
				amount: -500,
				currency: 'THB',
			},
			{
				payee: 'Gas Station',
				category: 'Transport',
				parentCategory: 'Transportation',
				description: 'Fuel',
				date: new Date(Date.UTC(2026, 0, 3)),
				amount: -1000,
				currency: 'THB',
			},
			{
				payee: 'Restaurant',
				category: 'Food',
				parentCategory: 'Food and Beverage',
				description: 'Dinner',
				date: new Date(Date.UTC(2026, 0, 4)),
				amount: -300,
				currency: 'THB',
			},
		]

		const sqliteBuffer = generateSQLite({ transactions: testData })

		// Upload the test file
		const fileInput = page.locator('input[type="file"]')
		await fileInput.setInputFiles({
			name: 'test-moneywiz.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: sqliteBuffer,
		})

		// Wait for the file to load and process
		await page.waitForTimeout(2000)

		// Check that transactions are loaded
		const transactionCountElement = page.locator(
			'[data-testid="transaction-count"]'
		)
		await expect(transactionCountElement).toBeVisible()

		const transactionCountText = await transactionCountElement.textContent()
		console.log('Transaction count:', transactionCountText)

		// Parse the number from text like "4 transactions"
		const countMatch = transactionCountText?.match(/(\d+)/)
		const transactionCount = countMatch ? parseInt(countMatch[1]) : 0
		expect(transactionCount).toBeGreaterThan(0)

		// Check if the filter bar is visible
		const filterBar = page.locator('[data-testid="filter-bar"]')
		await expect(filterBar).toBeVisible()

		console.log('Filter bar is visible - proceeding with filter tests')

		// Open the payee filter
		await page.click('[data-testid="filter-payee-chip"]')
		await expect(
			page.locator('[data-testid="filter-payee-panel"]')
		).toBeVisible()

		// Check the payee count text - should show the number of available payees
		const payeeCountText = await page
			.locator('[data-testid="payee-count-text"]')
			.textContent()
		console.log('Payee count text before refresh:', payeeCountText)
		expect(payeeCountText).not.toContain('0 payees')

		// Open the account filter
		await page.click('[data-testid="filter-account-chip"]')
		await expect(
			page.locator('[data-testid="filter-account-panel"]')
		).toBeVisible()

		// Check the account count text - should show at least 1 account
		const accountCountText = await page
			.locator('[data-testid="account-count-text"]')
			.textContent()
		console.log('Account count text before refresh:', accountCountText)
		expect(accountCountText).not.toContain('0 accounts')

		// Now refresh the page
		await page.reload()
		await page.waitForLoadState('networkidle')

		// Wait for data to load after refresh
		await page.waitForTimeout(3000)

		// Check that transactions are still loaded after refresh
		await expect(transactionCountElement).toBeVisible()
		const transactionCountAfterRefresh =
			await transactionCountElement.textContent()
		console.log(
			'Transaction count after refresh:',
			transactionCountAfterRefresh
		)
		expect(transactionCountAfterRefresh).toContain(transactionCount.toString())

		// Check if filter bar is still visible after refresh
		await expect(filterBar).toBeVisible()

		// Check payee filter again after refresh
		await page.click('[data-testid="filter-payee-chip"]')
		await expect(
			page.locator('[data-testid="filter-payee-panel"]')
		).toBeVisible()

		const payeeCountAfterRefresh = await page
			.locator('[data-testid="payee-count-text"]')
			.textContent()
		console.log('Payee count after refresh:', payeeCountAfterRefresh)

		// Check account filter again after refresh
		await page.click('[data-testid="filter-account-chip"]')
		await expect(
			page.locator('[data-testid="filter-account-panel"]')
		).toBeVisible()

		const accountCountAfterRefresh = await page
			.locator('[data-testid="account-count-text"]')
			.textContent()
		console.log('Account count after refresh:', accountCountAfterRefresh)

		// The counts should be the same before and after refresh
		expect(payeeCountAfterRefresh).toBe(payeeCountText)
		expect(accountCountAfterRefresh).toBe(accountCountText)

		// Most importantly, they should not show 0
		expect(payeeCountAfterRefresh).not.toContain('0 payees')
		expect(accountCountAfterRefresh).not.toContain('0 accounts')
	})

	test('should maintain filter selections after page refresh', async ({
		page,
	}) => {
		// Generate test data
		const testData: MoneyWizRecord[] = [
			{
				payee: 'Coffee Shop',
				category: 'Food',
				parentCategory: 'Food and Beverage',
				description: 'Morning coffee',
				date: new Date(Date.UTC(2026, 0, 1)),
				amount: -50,
				currency: 'THB',
			},
			{
				payee: 'Supermarket',
				category: 'Groceries',
				parentCategory: 'Food and Beverage',
				description: 'Weekly shopping',
				date: new Date(Date.UTC(2026, 0, 2)),
				amount: -500,
				currency: 'THB',
			},
		]

		const sqliteBuffer = generateSQLite({ transactions: testData })

		// Upload the test file
		const fileInput = page.locator('input[type="file"]')
		await fileInput.setInputFiles({
			name: 'test-moneywiz.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: sqliteBuffer,
		})

		// Wait for the file to load and process
		await page.waitForTimeout(2000)

		// Check that transactions are loaded
		const transactionCountElement = page.locator(
			'[data-testid="transaction-count"]'
		)
		await expect(transactionCountElement).toBeVisible()

		// Check if filter bar is visible
		const filterBar = page.locator('[data-testid="filter-bar"]')
		await expect(filterBar).toBeVisible()

		// Open payee filter and select a payee
		await page.click('[data-testid="filter-payee-chip"]')
		await expect(
			page.locator('[data-testid="filter-payee-panel"]')
		).toBeVisible()

		// Type something to search for payees
		await page.fill('[data-testid="payee-search-input"]', 'Coffee')
		await page.waitForTimeout(500)

		// Check if payee options are visible and select one
		const payeeOptions = page.locator('[data-testid="payee-option"]')
		const payeeCount = await payeeOptions.count()

		expect(payeeCount).toBeGreaterThan(0)

		// Select the first payee
		await payeeOptions.first().click()

		// Check that the payee is selected
		const selectedPayees = page.locator('[data-testid="selected-payee"]')
		await expect(selectedPayees).toHaveCount(1)

		// Refresh the page
		await page.reload()
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(3000)

		// Check that transactions are still loaded
		await expect(transactionCountElement).toBeVisible()
		await expect(filterBar).toBeVisible()

		// Check if the payee selection is preserved
		await page.click('[data-testid="filter-payee-chip"]')
		await expect(
			page.locator('[data-testid="filter-payee-panel"]')
		).toBeVisible()

		const selectedPayeesAfterRefresh = page.locator(
			'[data-testid="selected-payee"]'
		)
		await expect(selectedPayeesAfterRefresh).toHaveCount(1)

		// Verify the selected payee text
		const selectedPayeeText = await selectedPayeesAfterRefresh
			.first()
			.textContent()
		expect(selectedPayeeText).toBe('Coffee Shop')
	})
})
