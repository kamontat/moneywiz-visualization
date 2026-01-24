import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import './layout.css';

describe('/+page.svelte', () => {
	it('renders a blank canvas section', async () => {
		const { container } = render(Page);

		const canvas = container.querySelector('.blank-canvas');
		expect(canvas).toBeInTheDocument();
		expect(canvas).toBeVisible();
	});
});
