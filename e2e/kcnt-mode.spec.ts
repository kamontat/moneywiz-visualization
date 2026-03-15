import { test, expect } from '@playwright/test'

import { generateSQLite, type MoneyWizRecord } from './utils/sqlite-generator'

test.describe('KcNt Mode', () => {
	// Helper to upload test data
	const uploadTestData = async (page: any) => {
		const testData: MoneyWizRecord[] = [
			{
				payee: 'Test Shop',
				category: 'Food',
				parentCategory: 'Food and Beverage',
				description: 'Test expense',
				date: new Date(Date.UTC(2026, 0, 1)),
				amount: -100,
				currency: 'THB',
			},
		]

		const sqliteBuffer = generateSQLite({ transactions: testData })
		const fileInput = page.locator('input[type="file"]')
		await fileInput.setInputFiles({
			name: 'test-moneywiz.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: sqliteBuffer,
		})

		// Wait for data to load
		await page.waitForTimeout(2000)
	}

	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
	})

	test('should display KcNt mode toggle in filter bar', async ({ page }) => {
		await uploadTestData(page)

		// Check filter bar is visible
		const filterBar = page.locator('[data-testid="filter-bar"]')
		await expect(filterBar).toBeVisible()

		// Check KcNt toggle is visible
		const kcntToggle = page.locator('[data-testid="kcnt-mode-toggle"]')
		await expect(kcntToggle).toBeVisible()
	})

	test('should toggle KcNt mode when clicked', async ({ page }) => {
		await uploadTestData(page)

		const kcntToggle = page.locator('[data-testid="kcnt-mode-toggle"]')
		await expect(kcntToggle).toBeVisible()

		// Get the checkbox inside the toggle
		const checkbox = kcntToggle.locator('input[type="checkbox"]')

		// Initially should be unchecked
		await expect(checkbox).not.toBeChecked()

		// Click the toggle (label or checkbox)
		await kcntToggle.click()

		// Should now be checked
		await expect(checkbox).toBeChecked()

		// Click again to uncheck
		await kcntToggle.click()

		// Should be unchecked again
		await expect(checkbox).not.toBeChecked()
	})

	test('should persist KcNt mode state after page refresh', async ({
		page,
	}) => {
		await uploadTestData(page)

		const kcntToggle = page.locator('[data-testid="kcnt-mode-toggle"]')
		const checkbox = kcntToggle.locator('input[type="checkbox"]')

		// Enable KcNt mode
		await kcntToggle.click()
		await expect(checkbox).toBeChecked()

		// Refresh page
		await page.reload()
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(2000)

		// Toggle should still be checked after refresh
		const kcntToggleAfter = page.locator('[data-testid="kcnt-mode-toggle"]')
		const checkboxAfter = kcntToggleAfter.locator('input[type="checkbox"]')
		await expect(checkboxAfter).toBeChecked()
	})

	test('should clear KcNt mode when disabled via toggle', async ({ page }) => {
		await uploadTestData(page)

		const kcntToggle = page.locator('[data-testid="kcnt-mode-toggle"]')
		const checkbox = kcntToggle.locator('input[type="checkbox"]')

		// Enable and then disable KcNt mode
		await kcntToggle.click()
		await expect(checkbox).toBeChecked()

		await kcntToggle.click()
		await expect(checkbox).not.toBeChecked()

		// Refresh and verify state is not checked
		await page.reload()
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(2000)

		const checkboxAfter = page.locator(
			'[data-testid="kcnt-mode-toggle"] input[type="checkbox"]'
		)
		await expect(checkboxAfter).not.toBeChecked()
	})
})
