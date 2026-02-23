import { expect, test } from '@playwright/test'

import { defaultRecord, generateSQLite } from './utils/sqlite-generator'

const uploadFixture = async (page: import('@playwright/test').Page) => {
	const buffer = generateSQLite({ transactions: [defaultRecord] })
	const fileInput = page.locator('input[type="file"]').first()
	await fileInput.waitFor({ state: 'attached' })
	await fileInput.setInputFiles({
		name: 'report.sqlite',
		mimeType: 'application/x-sqlite3',
		buffer,
	})

	await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible()
}

test.describe('session persistence', () => {
	test('upload then refresh loads from persisted snapshot', async ({
		page,
	}) => {
		await page.goto('/')
		await uploadFixture(page)

		await page.reload()

		await expect(
			page.getByRole('button', { name: 'Clear loaded database' })
		).toBeVisible()
		await page.getByRole('tab', { name: 'Transactions' }).click()
		await expect(page.locator('table')).toBeVisible()
	})

	test('clear then refresh remains empty', async ({ page }) => {
		await page.goto('/')
		await uploadFixture(page)

		await page.getByRole('button', { name: 'Clear loaded database' }).click()
		await expect(page.getByText('Database cleared successfully')).toBeVisible()

		await page.reload()

		await expect(
			page.getByRole('button', { name: 'Clear loaded database' })
		).not.toBeVisible()
		await expect(page.getByText('Upload your data')).toBeVisible()
	})
})
