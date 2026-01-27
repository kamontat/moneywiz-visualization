import Button from './Button.svelte';
import { describe, it, expect, vi } from 'vitest';
import { page } from 'vitest/browser';

describe('Button Atom', () => {
	it('renders with correct classes for primary variant', async () => {
		const { getByRole } = page.render(Button, {
			props: { variant: 'primary', label: 'Test Button' }
		});
		const btn = getByRole('button', { name: 'Test Button' });
		await expect.element(btn).toHaveClass('bg-gradient-to-br');
	});

	it('handles clicks', async () => {
		const onclick = vi.fn();
		const { getByRole } = page.render(Button, { props: { onclick } });
		const btn = getByRole('button');
		await btn.click();
		expect(onclick).toHaveBeenCalled();
	});

	it('renders disabled state', async () => {
		const { getByRole } = page.render(Button, { props: { disabled: true } });
		const btn = getByRole('button');
		await expect.element(btn).toHaveAttribute('disabled');
	});
});
