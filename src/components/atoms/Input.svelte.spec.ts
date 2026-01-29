import Input from './Input.svelte'
import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'

describe('Input.svelte', () => {
	it('renders with default props', async () => {
		const { getByRole } = page.render(Input)
		const input = getByRole('textbox')

		await expect.element(input).toBeInTheDocument()
		await expect.element(input).toHaveClass('shadow-sm') // Base class
		await expect.element(input).not.toBeDisabled()
	})

	it('binds value', async () => {
		const value = 'initial'
		const { getByRole } = page.render(Input, { value })
		const input = getByRole('textbox')

		await expect.element(input).toHaveValue('initial')

		await input.fill('updated')
		await expect.element(input).toHaveValue('updated')
	})

	const variants = [
		{ name: 'default', expectedClass: 'border-0' }, // part of base class, but ensuring it doesn't break
		{ name: 'error', expectedClass: 'text-red-900' },
	]

	it.each(variants)('applies $name variant classes', async ({ name, expectedClass }) => {
		const { getByRole } = page.render(Input, { variant: name as any })
		const input = getByRole('textbox')
		await expect.element(input).toHaveClass(expectedClass)
	})

	it('applies fullWidth class', async () => {
		const { getByRole } = page.render(Input, { fullWidth: true })
		const input = getByRole('textbox')
		await expect.element(input).toHaveClass('w-full')
	})

	it('handles disabled state', async () => {
		const { getByRole } = page.render(Input, { disabled: true })
		const input = getByRole('textbox')
		await expect.element(input).toBeDisabled()
		await expect.element(input).toHaveClass('disabled:cursor-not-allowed')
	})

	it('sets type attribute', async () => {
		// Note: element with type='password' does not have role 'textbox' by default usually, unless implicit.
		// However, getByRole('textbox') might fail for password.
		// Let's use getByPlaceholder for this one or specific query.
		const { getByPlaceholder } = page.render(Input, { type: 'password', placeholder: 'pass' })
		const input = getByPlaceholder('pass')
		await expect.element(input).toHaveAttribute('type', 'password')
	})

	it('applies custom class', async () => {
		const { getByRole } = page.render(Input, { class: 'custom-class' })
		const input = getByRole('textbox')
		await expect.element(input).toHaveClass('custom-class')
	})

	it('handles unknown variant gracefully', async () => {
		const { getByRole } = page.render(Input, { variant: 'unknown' as any })
		const input = getByRole('textbox')
		await expect.element(input).toBeInTheDocument()
		// Should still have base classes
		await expect.element(input).toHaveClass('rounded-md')
	})

	it('passes through rest props', async () => {
		const { getByRole } = page.render(Input, { placeholder: 'Enter text', required: true })
		const input = getByRole('textbox')
		await expect.element(input).toHaveAttribute('placeholder', 'Enter text')
		await expect.element(input).toHaveAttribute('required', '')
	})
})
