import { test, expect } from '@playwright/test'

import { generateCsv, defaultRecord } from './utils/csv-generator'

test.describe('CSV Upload - MoneyWiz file', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('uploads CSV file and updates dashboard', async ({ page }) => {
		// Verify empty state on fresh load
		// Dashboard heading should be hidden when no data
		await expect(
			page.getByRole('heading', { name: 'Dashboard' })
		).not.toBeVisible()
		await expect(page.getByText('Welcome to MoneyWiz Report')).toBeVisible()

		// Generate CSV
		const csvContent = generateCsv([defaultRecord])

		// Upload CSV via hidden input
		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		// Verify dashboard updates with data
		// After upload, dashboard should show summary cards
		await expect(
			page.getByRole('heading', { name: 'report.csv' })
		).toBeVisible()

		// Use first() to avoid ambiguity if labels appear elsewhere
		await expect(
			page.getByText('Income', { exact: true }).first()
		).toBeVisible()
		await expect(
			page.getByText('Expenses', { exact: true }).first()
		).toBeVisible()
		await expect(
			page.getByText('Net / Cash Flow', { exact: true }).first()
		).toBeVisible()
		await expect(page.getByText('Saving Rate')).toBeVisible()

		// Charts should be visible
		await expect(
			page.getByRole('heading', { name: 'Top Categories' })
		).toBeVisible()
		await expect(
			page.getByRole('heading', { name: /Income & Expense Trend/i })
		).toBeVisible()
	})

	test('clears uploaded CSV and resets to empty state', async ({ page }) => {
		// Generate CSV
		const csvContent = generateCsv([defaultRecord])

		// Upload CSV file first
		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		// Verify upload was successful - preview should appear
		await expect(
			page.getByRole('heading', { name: 'report.csv' })
		).toBeVisible()
		await expect(page.getByText('Saving Rate')).toBeVisible()

		// Clear button should be visible after upload
		const clearButton = page.getByRole('button', { name: 'Clear loaded CSV' })
		await expect(clearButton).toBeVisible()

		// Click clear button
		await page.getByRole('button', { name: 'Clear loaded CSV' }).click()

		// Verify data is cleared
		// Preview section should be gone
		await expect(page.getByText('Saving Rate')).not.toBeVisible()

		// Clear button should be hidden
		await expect(
			page.getByRole('button', { name: 'Clear loaded CSV' })
		).not.toBeVisible()

		// Dashboard should show empty state message
		await expect(page.getByText('Welcome to MoneyWiz Report')).toBeVisible()
	})
})
