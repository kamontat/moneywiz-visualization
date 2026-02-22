import { expect, test } from '@playwright/test'

import { generateSQLite, defaultRecord } from './utils/sqlite-generator'

test.describe('Dashboard tab order', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('keeps Overview left-most and Transactions right-most', async ({
		page,
	}) => {
		const buffer = generateSQLite({ transactions: [defaultRecord] })

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })
		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()

		const tabs = page.locator('[role="tab"]')
		await expect(tabs).toHaveCount(5)
		await expect(tabs.nth(0)).toContainText('Overview')
		await expect(tabs.nth(1)).toContainText('Flow')
		await expect(tabs.nth(2)).toContainText('Drivers')
		await expect(tabs.nth(3)).toContainText('Risk')
		await expect(tabs.nth(4)).toContainText('Transactions')
		await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
	})
})
