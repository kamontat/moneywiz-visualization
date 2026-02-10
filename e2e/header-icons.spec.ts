import { test, expect } from '@playwright/test'

import { generateCsv, defaultRecord } from './utils/csv-generator'

test.describe('Header Icons', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('upload button has visible icon', async ({ page }) => {
		// The default text is "Upload CSV"
		const uploadBtn = page.getByRole('button', { name: /Upload CSV/ })
		await expect(uploadBtn).toBeVisible()

		// Check for SVG inside button
		const icon = uploadBtn.locator('svg')
		await expect(icon).toBeVisible()
		await expect(icon).toHaveAttribute('aria-hidden', 'true')
	})

	test('clear button has visible icon when loaded', async ({ page }) => {
		// Upload a file to make Clear button appear
		const fileInput = page.locator('input[type="file"]').first()

		const csvContent = generateCsv([defaultRecord])
		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		await expect(page.getByText(/Imported \d+ transactions/)).toBeVisible({
			timeout: 10000,
		})

		const clearBtn = page.getByRole('button', { name: 'Clear loaded CSV' })
		await expect(clearBtn).toBeVisible()

		const icon = clearBtn.locator('svg')
		await expect(icon).toBeVisible()
		await expect(icon).toHaveAttribute('aria-hidden', 'true')
	})
})
