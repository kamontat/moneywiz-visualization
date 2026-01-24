import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders a blank canvas section', async () => {
		render(Page);

		const canvas = page.locator('.blank-canvas');
		await expect.element(canvas).toBeInTheDocument();
		await expect.element(canvas).toBeVisible();
	});
});
