import { expect, test } from '@playwright/test'

import { defaultRecord, generateSQLite } from './utils/sqlite-generator'

test.describe('Date range quick presets', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('excludes current month for Last 12 Months', async ({
		page,
	}, testInfo) => {
		const buffer = generateSQLite({ transactions: [defaultRecord] })
		const [fileChooser] = await Promise.all([
			page.waitForEvent('filechooser'),
			page.getByRole('button', { name: 'Upload' }).click(),
		])

		await fileChooser.setFiles({
			name: 'report.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer,
		})

		await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()

		await page.getByRole('button', { name: 'Date' }).click()

		const expected = await page.evaluate(() => {
			const now = new Date()
			const year = now.getFullYear()
			const month = now.getMonth()
			const endOfLastMonth = new Date(year, month, 0, 23, 59, 59, 999)
			const startOfLast12Months = new Date(year, month - 12, 1, 0, 0, 0, 0)
			const formatDate = (date: Date) => date.toISOString().split('T')[0]

			return {
				last12Months: {
					start: formatDate(startOfLast12Months),
					end: formatDate(endOfLastMonth),
				},
			}
		})

		await page.getByRole('button', { name: 'Last 12 Months' }).click()
		await expect(page.locator('#start-date')).toHaveValue(
			expected.last12Months.start
		)
		await expect(page.locator('#end-date')).toHaveValue(
			expected.last12Months.end
		)

		await page.getByRole('button', { name: 'Last 12 Months' }).click()
		await expect(page.locator('#start-date')).toHaveValue('')
		await expect(page.locator('#end-date')).toHaveValue('')

		const screenshotPath = testInfo.outputPath('date-range-presets.png')
		await page.screenshot({ path: screenshotPath, fullPage: true })
		await testInfo.attach('date-range-presets', {
			path: screenshotPath,
			contentType: 'image/png',
		})
	})
})
