import Text from './Text.svelte'
import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import { createRawSnippet } from 'svelte'

describe('Text.svelte', () => {
	it('renders as paragraph by default with body variant', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Hello World</span>' }))
		const { getByText, container } = page.render(Text, { children })
		const text = getByText('Hello World')

		await expect.element(text).toBeInTheDocument()
		const p = container.querySelector('p')
		expect(p).toBeInTheDocument()
		expect(p).toHaveClass('text-mw-text-main')
	})

	const variants = [
		{ name: 'body', expectedClass: 'text-mw-text-main' },
		{ name: 'muted', expectedClass: 'text-mw-text-muted' },
		{ name: 'small', expectedClass: 'text-xs' },
		{ name: 'error', expectedClass: 'text-red-500' },
	]

	it.each(variants)('renders $name variant correctly', async ({ name, expectedClass }) => {
		const children = createRawSnippet(() => ({ render: () => '<span>Text</span>' }))
		const { container } = page.render(Text, { variant: name as any, children })
		const p = container.querySelector('p')
		expect(p).toBeInTheDocument()
		await expect.element(p).toHaveClass(expectedClass)
	})

	it('renders custom tag', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Span Text</span>' }))
		const { container } = page.render(Text, { tag: 'span', children })
		const span = container.querySelector('span')
		expect(span).toBeInTheDocument()
		expect(span).toHaveTextContent('Span Text')
	})

	it('applies custom class', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Text</span>' }))
		const { container } = page.render(Text, { class: 'custom-class', children })
		const p = container.querySelector('p')
		await expect.element(p).toHaveClass('custom-class')
	})

	it('handles unknown variant gracefully', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Text</span>' }))
		const { container } = page.render(Text, { variant: 'unknown' as any, children })
		const p = container.querySelector('p')
		await expect.element(p).toBeInTheDocument()
	})
})
