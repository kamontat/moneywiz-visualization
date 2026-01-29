import { createRawSnippet } from 'svelte'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import Panel from './Panel.svelte'

describe('Panel', () => {
	it('renders children correctly', async () => {
		const children = createRawSnippet(() => ({
			render: () => 'Test Content',
		}))
		const { getByText } = page.render(Panel, { children })

		await expect.element(getByText('Test Content')).toBeInTheDocument()
	})

	it('applies default classes', async () => {
		// Use aria-label to easily locate the specific panel
		page.render(Panel, { 'aria-label': 'Default Panel' })
		const element = page.getByLabelText('Default Panel')

		await expect.element(element).toBeInTheDocument()
		await expect.element(element).toHaveClass('bg-mw-surface')
		await expect.element(element).toHaveClass('rounded-xl')
		await expect.element(element).toHaveClass('shadow-sm')
	})

	it('accepts custom classes', async () => {
		page.render(Panel, { class: 'custom-class', 'aria-label': 'Custom Panel' })
		const element = page.getByLabelText('Custom Panel')

		await expect.element(element).toBeInTheDocument()
		await expect.element(element).toHaveClass('custom-class')
		await expect.element(element).toHaveClass('bg-mw-surface') // Should still have base classes
	})

	it('renders as specified tag', async () => {
		// section with aria-label has role 'region'
		page.render(Panel, { tag: 'section', 'aria-label': 'Section Panel' })
		const element = page.getByRole('region', { name: 'Section Panel' })

		await expect.element(element).toBeInTheDocument()
		await expect.element(element).toHaveClass('bg-mw-surface')
	})
})
