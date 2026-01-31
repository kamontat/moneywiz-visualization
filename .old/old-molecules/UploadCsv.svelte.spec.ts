import { describe, it, expect, vi, beforeEach } from 'vitest'
import { page } from 'vitest/browser'

import UploadCsv from './UploadCsv.svelte'

import { parseCsvFile } from '$lib/csv'

vi.mock('$lib/csv', () => {
	return {
		parseCsvFile: vi.fn(),
		CsvParseError: class extends Error {},
	}
})

describe('CsvUploadButton.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders with default label', async () => {
		const { container } = page.render(UploadCsv)
		const button = container.querySelector('button')
		expect(button).toHaveTextContent('Upload CSV')
		// Check for icon
		const icon = button?.querySelector('svg')
		expect(icon).toBeInTheDocument()
	})

	it('renders with custom label', async () => {
		const { container } = page.render(UploadCsv, { label: 'Import Data' })
		const button = container.querySelector('button')
		expect(button).toHaveTextContent('Import Data')
	})

	it('has a hidden file input', async () => {
		const { container } = page.render(UploadCsv)
		const input = container.querySelector('input[type="file"]')
		expect(input).toBeInTheDocument()
		expect(input).toHaveClass('sr-only')
	})

	it('handles file selection', async () => {
		vi.mocked(parseCsvFile).mockResolvedValue({
			headers: ['Date', 'Amount'],
			rows: [{ Date: '2023-01-01', Amount: '100' }],
		})
		const onParsedSpy = vi.fn()

		const { container } = page.render(UploadCsv, { onparsed: onParsedSpy })
		const input = container.querySelector('input[type="file"]') as HTMLInputElement

		// Create a fake file
		const file = new File(['header\nvalue'], 'test.csv', { type: 'text/csv' })

		// Simulate file selection
		Object.defineProperty(input, 'files', {
			value: [file],
			writable: false,
		})

		input.dispatchEvent(new Event('change', { bubbles: true }))

		// Wait for async operation (microtask)
		await new Promise((resolve) => setTimeout(resolve, 0))

		expect(parseCsvFile).toHaveBeenCalledWith(file)
		expect(onParsedSpy).toHaveBeenCalledWith({
			file,
			data: {
				headers: ['Date', 'Amount'],
				rows: [{ Date: '2023-01-01', Amount: '100' }],
			},
		})
	})

	it('handles parse error', async () => {
		const error = new Error('Invalid format')
		vi.mocked(parseCsvFile).mockRejectedValue(error)
		const onErrorSpy = vi.fn()

		const { container } = page.render(UploadCsv, { onerror: onErrorSpy })
		const input = container.querySelector('input[type="file"]') as HTMLInputElement
		const file = new File(['bad content'], 'bad.csv', { type: 'text/csv' })

		Object.defineProperty(input, 'files', {
			value: [file],
			writable: false,
		})

		input.dispatchEvent(new Event('change', { bubbles: true }))

		await new Promise((resolve) => setTimeout(resolve, 0))

		expect(parseCsvFile).toHaveBeenCalledWith(file)
		expect(onErrorSpy).toHaveBeenCalledWith({
			file,
			message: 'Invalid format',
		})
	})
})
