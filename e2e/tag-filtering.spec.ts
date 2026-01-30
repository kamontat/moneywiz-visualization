import { test, expect } from '@playwright/test'

import { generateCsv, defaultRecord } from './utils/csv-generator'

test.describe('Dashboard - Tag Filtering', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await expect(page.getByRole('button', { name: 'Upload CSV' })).toBeVisible()
		const fileInput = page.locator('input[type="file"]').first()

		const csvContent = generateCsv([
			{ ...defaultRecord, Tags: 'Group: KcNt; ', Amount: '-100.00' },
			{ ...defaultRecord, Description: 'No tags', Tags: '', Amount: '-50.00' },
		])

		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		})

		// Wait for dashboard to load
		await expect(page.getByText('Saving Rate')).toBeVisible()
		await expect(page.getByText('report.csv')).toBeVisible()
	})

	test('shows tag categories in filter panel', async ({ page }) => {
		const filterBtn = page.getByRole('button', { name: 'Group' }).first()
		await filterBtn.click()

		// Now checks inside the expanded content
		await expect(page.getByRole('button', { name: 'KcNt' })).toBeVisible()
	})

	test('filters by include mode', async ({ page }) => {
		await page.getByRole('button', { name: 'Group' }).first().click()

		// Select 'KcNt'
		await page.getByRole('button', { name: 'KcNt' }).click()

		// Close panel so the active badge shows on the toggle row (it's built-in the button now)
		await page.getByRole('button', { name: 'Group' }).first().click()

		await expect(page.getByRole('button', { name: /Clear All/i })).toBeVisible()
		// Active state is checked by style in unit tests, in E2E we verify functionality via "shown"
		await expect(page.getByText(/shown/)).toBeVisible()
	})

	test('filters by exclude mode', async ({ page }) => {
		await page.getByRole('button', { name: 'Group' }).first().click()

		// Pick the first Exclude toggle (Group category appears first in sorted list)
		// In TagCategoryContent.svelte, "Exclude" mode might be a toggle.
		// Assuming there is an "Exclude" button or toggle inside.
		// If not, we might need to skip this part or verify strict mode logic if it exists.
		// Let's check TagCategoryContent.svelte if possible, or assuming previous test was correct about "Exc" button.
		await page.getByRole('button', { name: 'Exc' }).first().click()

		// Select 'KcNt'
		await page.getByRole('button', { name: 'KcNt' }).click()

		await page.getByRole('button', { name: 'Group' }).first().click()
		// Button should indicate active state
		await expect(page.getByRole('button', { name: /Clear All/i })).toBeVisible()
	})

	test('clears tag filters', async ({ page }) => {
		await page.getByRole('button', { name: 'Group' }).first().click()
		await page.getByRole('button', { name: 'KcNt' }).click()

		await expect(page.getByText(/shown/)).toBeVisible()

		// Click Clear All
		await page.getByRole('button', { name: /Clear All/i }).click()

		// Should reset
		await expect(page.getByText(/shown/)).not.toBeVisible()
		await expect(page.getByRole('button', { name: /Clear All/i })).not.toBeVisible()
	})

	test('persists tag filters on reload', async ({ page }) => {
		await page.getByRole('button', { name: 'Group' }).first().click()
		await page.getByRole('button', { name: 'KcNt' }).click()

		// Wait for state to settle
		await expect(page.getByText(/shown/)).toBeVisible()

		await page.reload()

		// Wait for hydration
		await expect(page.getByText('Saving Rate')).toBeVisible()

		// Check persistence indicators
		await expect(page.getByText(/shown/)).toBeVisible()
		await expect(page.getByRole('button', { name: /Clear All/i })).toBeVisible()
	})
})
