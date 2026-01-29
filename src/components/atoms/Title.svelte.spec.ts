import Title from './Title.svelte'
import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import { createRawSnippet } from 'svelte'

describe('Title.svelte', () => {
	it('renders h2 by default (level 2)', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Heading</span>' }))
		const { getByRole } = page.render(Title, { children })
		const heading = getByRole('heading', { level: 2 })
		await expect.element(heading).toBeInTheDocument()
		await expect.element(heading).toHaveClass('text-2xl')
	})

	const levels = [
		{ level: 1, expectedClass: 'text-3xl' },
		{ level: 2, expectedClass: 'text-2xl' },
		{ level: 3, expectedClass: 'text-lg' },
		{ level: 4, expectedClass: 'text-base' },
		{ level: 5, expectedClass: 'text-sm' },
		{ level: 6, expectedClass: 'text-xs' },
	]

	it.each(levels)('renders level $level', async ({ level, expectedClass }) => {
		const children = createRawSnippet(() => ({ render: () => '<span>Heading</span>' }))
		const { getByRole } = page.render(Title, { level: level as any, children })
		const heading = getByRole('heading', { level })
		await expect.element(heading).toBeInTheDocument()
		await expect.element(heading).toHaveClass(expectedClass)
	})

	it('renders with id', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Heading</span>' }))
		const { container } = page.render(Title, { id: 'my-title', children })
		const heading = container.querySelector('#my-title')
		expect(heading).toBeInTheDocument()
	})

	it('applies custom class', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Heading</span>' }))
		const { getByRole } = page.render(Title, { class: 'custom-class', children })
		await expect.element(getByRole('heading')).toHaveClass('custom-class')
	})

	it('handles unknown level gracefully', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Heading</span>' }))
		const { container } = page.render(Title, { level: 99 as any, children })
		const heading = container.querySelector('h99')
		expect(heading).toBeInTheDocument()
	})
})
