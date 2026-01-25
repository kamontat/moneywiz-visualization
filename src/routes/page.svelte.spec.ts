import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import './layout.css';
import { csvStore } from '$lib/stores/csv';

describe('/+page.svelte', () => {
	beforeEach(() => {
		csvStore.reset();
	});

	it('renders a blank canvas section', async () => {
		const { container } = render(Page);

		const canvas = container.querySelector('.blank-canvas');
		expect(canvas).toBeInTheDocument();
		expect(canvas).toBeVisible();
	});

	it('does not render Dashboard heading when no data', async () => {
		const { container } = render(Page);
		const dashboardHeading = container.querySelector('h1#dash-title');
		expect(dashboardHeading).toBeNull();
	});
});
