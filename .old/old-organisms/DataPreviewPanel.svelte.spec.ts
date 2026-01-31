import { describe, it, expect } from 'vitest'
import { page , userEvent } from 'vitest/browser'

import DataPreviewPanel from './DataPreviewPanel.svelte'

describe('DataPreviewPanel.svelte', () => {
	const mockData = {
		headers: ['Name', 'Amount', 'Date'],
		rows: [
			{ Name: 'Item 1', Amount: '100', Date: '2023-01-01' },
			{ Name: 'Item 2', Amount: '200', Date: '2023-01-02' },
		],
	}

	it('renders table immediately when data is provided', async () => {
		const { container } = page.render(DataPreviewPanel, { data: mockData })

		// Table should be visible immediately without clicking
		const table = container.querySelector('table')
		expect(table).not.toBeNull()

		// Content should show data
		expect(container).toHaveTextContent('Item 1')
		expect(container).toHaveTextContent('Item 2')
	})

	it('renders table headers correctly', async () => {
		const { container } = page.render(DataPreviewPanel, { data: mockData })

		const ths = container.querySelectorAll('th')
		expect(ths).toHaveLength(3)
		expect(ths[0]).toHaveTextContent('Name')
		expect(ths[2]).toHaveTextContent('Date')
	})

	it('shows "no rows" message if data has no rows', async () => {
		const emptyData = { headers: ['Col1'], rows: [] }
		const { container } = page.render(DataPreviewPanel, { data: emptyData })

		expect(container).toHaveTextContent('No data rows found')
	})

	it('renders nothing if data is null', async () => {
		const { container } = page.render(DataPreviewPanel, { data: null })
		// Svelte may leave comment nodes, but there should be no elements
		expect(container.childElementCount).toBe(0)
		expect(container).toHaveTextContent('')
	})

	it('shows row count message when more than 5 rows exist', async () => {
		const manyRows = {
			headers: ['Name'],
			rows: Array.from({ length: 10 }, (_, i) => ({ Name: `Item ${i + 1}` })),
		}
		const { container } = page.render(DataPreviewPanel, { data: manyRows })

		expect(container).toHaveTextContent('Showing first 5 rows of 10')
	})

	it('displays correct number of rows (max 5 preview rows)', async () => {
		const manyRows = {
			headers: ['Name'],
			rows: Array.from({ length: 10 }, (_, i) => ({ Name: `Item ${i + 1}` })),
		}
		const { container } = page.render(DataPreviewPanel, { data: manyRows })

		const trs = container.querySelectorAll('tbody tr')
		expect(trs).toHaveLength(5)
	})

	it('renders dropdown with correct options', async () => {
		const { container } = page.render(DataPreviewPanel, { data: mockData })

		const select = container.querySelector('select')
		expect(select).not.toBeNull()

		const options = select!.querySelectorAll('option')
		expect(options).toHaveLength(5)
		// Check that options are 5, 10, 20, 50, 100
		expect(options[0].value).toBe('5')
		expect(options[1].value).toBe('10')
		expect(options[2].value).toBe('20')
		expect(options[3].value).toBe('50')
		expect(options[4].value).toBe('100')
	})

	it('changes displayed rows when dropdown selection changes', async () => {
		const manyRows = {
			headers: ['Name'],
			rows: Array.from({ length: 20 }, (_, i) => ({ Name: `Item ${i + 1}` })),
		}
		const { container } = page.render(DataPreviewPanel, { data: manyRows })

		// Initially 5
		expect(container.querySelectorAll('tbody tr')).toHaveLength(5)

		const select = container.querySelector('select')
		await userEvent.selectOptions(select!, '10')

		// Updated to 10
		expect(container.querySelectorAll('tbody tr')).toHaveLength(10)
		expect(container).toHaveTextContent('Showing first 10 rows of 20')
	})
})
