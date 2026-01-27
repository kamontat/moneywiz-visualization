import MoneyLogo from './MoneyLogo.svelte';
import { describe, it, expect, vi } from 'vitest';
import { page } from 'vitest/browser';

describe('MoneyLogo.svelte', () => {
	it('renders correctly', async () => {
		const { container } = page.render(MoneyLogo);
		expect(container).toHaveTextContent('$');
	});

	it('accepts size prop', async () => {
		const { container } = page.render(MoneyLogo, { size: 50 });
		const div = container.querySelector('div');
		expect(div).toHaveStyle({ width: '50px', height: '50px' });
	});
});
