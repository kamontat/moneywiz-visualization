import { test, expect } from '@playwright/test'

import { generateSQLite, defaultRecord } from './utils/sqlite-generator'

test.describe('Error Handling - Invalid and Corrupted Files', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('does not crash on non-SQLite file upload', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const pageErrors: string[] = []
		page.on('pageerror', (error) => {
			pageErrors.push(error.message)
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const invalidBuffer = Buffer.from('This is not a SQLite database file')
		await fileInput.setInputFiles({
			name: 'invalid.txt',
			mimeType: 'text/plain',
			buffer: invalidBuffer,
		})

		await page.waitForTimeout(3000)

		await expect(page.getByText('Upload your data')).toBeVisible()
		expect(pageErrors.length).toBe(0)
	})

	test('does not crash on corrupted SQLite file', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const pageErrors: string[] = []
		page.on('pageerror', (error) => {
			pageErrors.push(error.message)
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const corruptedBuffer = Buffer.alloc(4096)
		corruptedBuffer.write('SQLite format 3\0', 0)
		for (let i = 16; i < 4096; i++) {
			corruptedBuffer[i] = Math.floor(Math.random() * 256)
		}

		await fileInput.setInputFiles({
			name: 'corrupted.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: corruptedBuffer,
		})

		await page.waitForTimeout(3000)

		await expect(page.getByText('Upload your data')).toBeVisible()
		expect(pageErrors.length).toBe(0)
	})

	test('does not crash on malformed SQLite header', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const pageErrors: string[] = []
		page.on('pageerror', (error) => {
			pageErrors.push(error.message)
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const malformedBuffer = Buffer.alloc(100)
		malformedBuffer.write('SQLite bad format', 0)

		await fileInput.setInputFiles({
			name: 'malformed.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: malformedBuffer,
		})

		await page.waitForTimeout(3000)

		await expect(page.getByText('Upload your data')).toBeVisible()
		expect(pageErrors.length).toBe(0)
	})

	test('successfully uploads valid SQLite file after invalid attempt', async ({
		page,
	}) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const invalidBuffer = Buffer.from('Invalid SQLite content')
		await fileInput.setInputFiles({
			name: 'invalid.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: invalidBuffer,
		})

		await page.waitForTimeout(2000)

		const validBuffer = generateSQLite({ transactions: [defaultRecord] })
		await fileInput.setInputFiles({
			name: 'valid.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: validBuffer,
		})

		await expect(page.getByText(/Imported [\d,]+ transactions/)).toBeVisible({
			timeout: 10000,
		})
	})

	test('does not leave loading text visible after invalid upload', async ({
		page,
	}) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const invalidBuffer = Buffer.from('Bad database file')
		await fileInput.setInputFiles({
			name: 'bad.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: invalidBuffer,
		})

		await page.waitForTimeout(3000)

		const loadingSavedData = page.getByText('Loading saved data')
		await expect(loadingSavedData).not.toBeVisible()
	})

	test('handles zero-byte file upload gracefully', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const pageErrors: string[] = []
		page.on('pageerror', (error) => {
			pageErrors.push(error.message)
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const emptyBuffer = Buffer.alloc(0)
		await fileInput.setInputFiles({
			name: 'empty.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: emptyBuffer,
		})

		await page.waitForTimeout(3000)

		await expect(page.getByText('Upload your data')).toBeVisible()
		expect(pageErrors.length).toBe(0)
	})

	test('handles truncated SQLite file gracefully', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const pageErrors: string[] = []
		page.on('pageerror', (error) => {
			pageErrors.push(error.message)
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const truncatedBuffer = Buffer.alloc(50)
		truncatedBuffer.write('SQLite format 3\0', 0)

		await fileInput.setInputFiles({
			name: 'truncated.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: truncatedBuffer,
		})

		await page.waitForTimeout(3000)

		await expect(page.getByText('Upload your data')).toBeVisible()
		expect(pageErrors.length).toBe(0)
	})
})

test.describe('Error Handling - Worker and Application Stability', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('does not crash app on worker processing error', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const pageErrors: string[] = []

		page.on('pageerror', (error) => {
			pageErrors.push(error.message)
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const invalidBuffer = Buffer.from(
			'Fake SQLite data that will cause worker error'
		)
		await fileInput.setInputFiles({
			name: 'worker-error.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: invalidBuffer,
		})

		await page.waitForTimeout(3000)

		await expect(page.getByText('Upload your data')).toBeVisible()
		expect(pageErrors.length).toBe(0)
	})

	test('maintains app stability after multiple invalid uploads', async ({
		page,
	}) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const pageErrors: string[] = []

		page.on('pageerror', (error) => {
			pageErrors.push(error.message)
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const badBuffer = Buffer.from('This will cause parsing error')
		await fileInput.setInputFiles({
			name: 'bad-parse-1.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: badBuffer,
		})

		await page.waitForTimeout(2000)

		await fileInput.setInputFiles({
			name: 'bad-parse-2.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: badBuffer,
		})

		await page.waitForTimeout(2000)

		await fileInput.setInputFiles({
			name: 'bad-parse-3.sqlite',
			mimeType: 'application/x-sqlite3',
			buffer: badBuffer,
		})

		await page.waitForTimeout(2000)

		await expect(page.getByText('Upload your data')).toBeVisible()
		expect(pageErrors.length).toBe(0)
	})

	test('does not display uncaught errors in console', async ({ page }) => {
		await expect(page.getByText('Upload your data')).toBeVisible()

		const consoleErrors: string[] = []

		page.on('console', (message) => {
			if (message.type() === 'error') {
				consoleErrors.push(message.text())
			}
		})

		const fileInput = page.locator('input[type="file"]').first()
		await fileInput.waitFor({ state: 'attached' })

		const invalidBuffer = Buffer.from('Not a database')
		await fileInput.setInputFiles({
			name: 'test.db',
			mimeType: 'application/octet-stream',
			buffer: invalidBuffer,
		})

		await page.waitForTimeout(3000)

		await expect(page.getByText('Upload your data')).toBeVisible()

		const uncaughtErrors = consoleErrors.filter(
			(err) =>
				err.includes('Uncaught') ||
				err.includes('unhandled') ||
				err.includes('at Object.') ||
				err.includes('at Module.')
		)
		expect(uncaughtErrors.length).toBe(0)
	})
})
