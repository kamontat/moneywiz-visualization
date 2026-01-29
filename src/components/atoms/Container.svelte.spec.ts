import Container from './Container.svelte'
import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import { createRawSnippet } from 'svelte'

describe('Container.svelte', () => {
	it('renders as div by default', async () => {
		const { container } = page.render(Container)
		const div = container.querySelector('.container')
		expect(div).toBeInTheDocument()
		expect(div?.tagName.toLowerCase()).toBe('div')
	})

	it('renders as custom tag', async () => {
		const { container } = page.render(Container, { tag: 'section' })
		const section = container.querySelector('.container')
		expect(section).toBeInTheDocument()
		expect(section?.tagName.toLowerCase()).toBe('section')
	})

	it('renders children', async () => {
		const children = createRawSnippet(() => ({
			render: () => '<span>Content</span>',
		}))
		const { getByText } = page.render(Container, { children })
		await expect.element(getByText('Content')).toBeInTheDocument()
	})

	it('applies custom class', async () => {
		const { container } = page.render(Container, { class: 'custom-class' })
		const div = container.querySelector('.container')
		expect(div).toHaveClass('custom-class')
	})
})
