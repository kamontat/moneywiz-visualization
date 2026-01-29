import Button from './Button.svelte'
import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import { createRawSnippet } from 'svelte'

describe('Button.svelte', () => {
	it('renders with default props', async () => {
		const { getByRole } = page.render(Button)
		const button = getByRole('button')

		await expect.element(button).toBeInTheDocument()
		await expect.element(button).toHaveClass('px-3.5') // Primary variant class
		await expect.element(button).not.toBeDisabled()
	})

	it('renders children', async () => {
		const children = createRawSnippet(() => ({
			render: () => '<span>Click me</span>',
		}))
		const { getByText } = page.render(Button, { children })
		await expect.element(getByText('Click me')).toBeInTheDocument()
	})

	const variants = [
		{ name: 'primary', expectedClass: 'text-white' },
		{ name: 'danger', expectedClass: 'text-red-600' },
		{ name: 'ghost', expectedClass: 'text-mw-text-muted' },
		{ name: 'tab', expectedClass: 'rounded-none' },
		{ name: 'icon', expectedClass: 'hover:bg-black/5' },
	]

	it.each(variants)('applies $name variant classes', async ({ name, expectedClass }) => {
		const { getByRole } = page.render(Button, { variant: name as any })
		const button = getByRole('button')
		await expect.element(button).toHaveClass(expectedClass)
	})

	it('handles disabled state', async () => {
		const { getByRole } = page.render(Button, { disabled: true })
		const button = getByRole('button')
		await expect.element(button).toBeDisabled()
		await expect.element(button).toHaveClass('disabled:opacity-75')
	})

	it('handles active state on tab variant', async () => {
		const { getByRole } = page.render(Button, { variant: 'tab', active: true })
		const button = getByRole('button')
		await expect.element(button).toHaveClass('border-mw-primary')
		await expect.element(button).toHaveAttribute('aria-current', 'page')
	})

	it('sets type attribute', async () => {
		const { getByRole } = page.render(Button, { type: 'submit' })
		const button = getByRole('button')
		await expect.element(button).toHaveAttribute('type', 'submit')
	})

	it('sets aria-label', async () => {
		const { getByLabelText } = page.render(Button, { label: 'My Action' })
		const button = getByLabelText('My Action')
		await expect.element(button).toBeInTheDocument()
	})

	it('applies custom class', async () => {
		const { getByRole } = page.render(Button, { class: 'custom-class' })
		const button = getByRole('button')
		await expect.element(button).toHaveClass('custom-class')
	})

	it('handles unknown variant gracefully', async () => {
		const { getByRole } = page.render(Button, { variant: 'unknown' as any })
		const button = getByRole('button')
		await expect.element(button).toBeInTheDocument()
		// Should still have base classes
		await expect.element(button).toHaveClass('inline-flex')
	})
})
