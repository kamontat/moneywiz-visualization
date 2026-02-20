import { test, expect } from '@playwright/test'

import { generateSQLite, defaultRecord } from './utils/sqlite-generator'

test.describe('Header Icons', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('upload button has visible icon', async ({ page }) => {
		const uploadBtn = page.getByRole('button', { name: /Upload/ })
		await expect(uploadBtn).toBeVisible()

		// Check for SVG inside button
		const icon = uploadBtn.locator('svg')
		await expect(icon).toBeVisible()
		await expect(icon).toHaveAttribute('aria-hidden', 'true')
	})

	test('clear button has visible icon when loaded', async ({ page }) => {
		// Upload a file to make Clear button appear
		const fileInput = page.locator('input[type="file"]').first()

		const buffer = generateSQLite({ transactions: [defaultRecord] })
		await fileInput.setInputFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(page.getByText(/Imported \d+ transactions/)).toBeVisible({
			timeout: 10000,
		})

		const clearBtn = page.getByRole('button', { name: 'Clear loaded database' })
		await expect(clearBtn).toBeVisible()

		const icon = clearBtn.locator('svg')
		await expect(icon).toBeVisible()
		await expect(icon).toHaveAttribute('aria-hidden', 'true')
	})
})
