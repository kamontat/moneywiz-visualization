import { test, expect } from '@playwright/test'
import { generateCsv, defaultRecord } from './utils/csv-generator'

test.describe('CSV Preview Table Layout', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('preview table displays all columns without wrapping headers', async ({ page }) => {
		// Upload CSV file to show preview table
		const fileInput = page.locator('input[type="file"]').first()
		const csvContent = generateCsv([defaultRecord])
		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		// Wait for dashboard to load
		await expect(page.getByText('Saving Rate')).toBeVisible()

		// Navigate to Preview tab and verify table is visible
		// Click the Preview tab to view the data table
		await page.getByRole('button', { name: 'Preview' }).click()

		// Wait for the Preview tab to be active
		await expect(page.getByRole('button', { name: 'Preview' })).toHaveAttribute(
			'aria-current',
			'page'
		)

		const table = page.locator('table').first()
		await expect(table).toBeVisible()

		// Verify all column headers are visible and not wrapped
		// Scope to table in the visible preview panel
		const headers = table.locator('thead th')
		const headerCount = await headers.count()
		expect(headerCount).toBe(12)

		const checkHeader = table.locator('thead th:has-text("Check #")')
		await expect(checkHeader).toBeVisible()

		const box = await checkHeader.boundingBox()
		expect(box).toBeTruthy()
		if (box) {
			expect(box.height).toBeLessThan(50)
		}

		// Verify table extends to full width of container
		// Find the table and its immediate parent (overflow container)
		const overflowContainer = page
			.locator('.border.border-mw-border.rounded-lg')
			.filter({ has: table })
			.first()

		const containerBox = await overflowContainer.boundingBox()
		const tableBox = await table.boundingBox()

		expect(containerBox).toBeTruthy()
		expect(tableBox).toBeTruthy()

		if (containerBox && tableBox) {
			// Table should be at least as wide as the container (for scrollability)
			// When content needs to scroll, table width >= container width
			expect(tableBox.width).toBeGreaterThanOrEqual(containerBox.width - 2)
		}

		// Verify all column data is visible without horizontal scroll cutoff
		const lastColumn = table.locator('thead th:last-child')
		await expect(lastColumn).toBeVisible()

		const lastColumnBox = await lastColumn.boundingBox()
		expect(lastColumnBox).toBeTruthy()

		if (lastColumnBox) {
			expect(lastColumnBox.x + lastColumnBox.width).toBeGreaterThan(0)
		}
	})

	test('tab switching between Overview and Preview works', async ({ page }) => {
		// Upload CSV file
		const fileInput = page.locator('input[type="file"]').first()
		const csvContent = generateCsv([defaultRecord])
		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		// Wait for dashboard to load
		await expect(page.getByText('Saving Rate')).toBeVisible()

		// Verify Overview tab is default
		const overviewTab = page.getByRole('button', { name: 'Overview' })
		await expect(overviewTab).toHaveAttribute('aria-current', 'page')

		// Switch to Preview tab
		await page.getByRole('button', { name: 'Preview' }).click()

		const previewTab = page.getByRole('button', { name: 'Preview' })
		await expect(previewTab).toHaveAttribute('aria-current', 'page')

		const table = page.locator('table').first()
		await expect(table).toBeVisible()

		// Switch back to Overview tab
		await page.getByRole('button', { name: 'Overview' }).click()

		await expect(overviewTab).toHaveAttribute('aria-current', 'page')
		// Preview tab should no longer be active
		await expect(previewTab).not.toHaveAttribute('aria-current', 'page')
	})

	test('dropdown changes displayed row count', async ({ page }) => {
		// Generate large dataset
		const largeData = Array.from({ length: 110 }, (_, i) => ({
			...defaultRecord,
			Description: `Item ${i}`,
		}))
		const csvContent = generateCsv(largeData)

		// Upload CSV file
		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		// Navigate to Preview tab
		// It might need time to upload/process
		await page.waitForTimeout(500)

		await page.getByRole('button', { name: 'Preview' }).click()
		await expect(page.locator('table').first()).toBeVisible()

		// Verify default row count is 5
		const rows = page.locator('tbody tr')
		await expect(rows).toHaveCount(5)

		const dropdown = page.locator('#row-limit-select')
		await expect(dropdown).toHaveValue('5')

		await expect(page.getByText(/Showing first 5 rows/)).toBeVisible()

		// Change row count to 10
		await dropdown.selectOption('10')

		await expect(rows).toHaveCount(10)

		await expect(page.getByText(/Showing first 10 rows/)).toBeVisible()

		// Change row count to 100
		await dropdown.selectOption('100')

		await expect(rows).toHaveCount(100)

		await expect(page.getByText(/Showing first 100 rows/)).toBeVisible()
	})
})
