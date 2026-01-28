import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import DateFilterContent from './DateFilterContent.svelte'

function formatDate(d: Date | null) {
	if (!d) return ''
	const year = d.getFullYear()
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

describe('DateFilterContent', () => {
	it('updates inputs when state changes', async () => {
		const { getByLabelText } = page.render(DateFilterContent)

		const startInput = getByLabelText('Start')
		const endInput = getByLabelText('End')

		await startInput.fill('2023-01-01')
		await endInput.fill('2023-01-31')

		await expect.element(startInput).toHaveValue('2023-01-01')
		await expect.element(endInput).toHaveValue('2023-01-31')
	})

	it('applies presets', async () => {
		const { getByText, getByLabelText } = page.render(DateFilterContent)
		const monthBtn = getByText('This Month')

		await monthBtn.click()

		const now = new Date()
		const startStr = formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
		const endStr = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()))

		const startInput = getByLabelText('Start')
		const endInput = getByLabelText('End')

		await expect.element(startInput).toHaveValue(startStr)
		await expect.element(endInput).toHaveValue(endStr)
	})
})
