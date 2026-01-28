import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import FilterBar from './FilterBar.svelte';

describe('FilterBar', () => {
	it('renders filter buttons for date and categories', async () => {
		const rows = [{ Tags: 'Bank: KBank' }, { Tags: 'Bank: SCB; Project: A' }] as any;

		const { getByText } = page.render(FilterBar, { props: { rows } });

		await expect.element(getByText('Date')).toBeVisible();
		await expect.element(getByText('Bank')).toBeVisible();
		await expect.element(getByText('Project')).toBeVisible();
	});

	it('expands date content on click', async () => {
		const { getByText, getByRole } = page.render(FilterBar);
		const dateBtn = getByRole('button', { name: 'Date' });

		await dateBtn.click();

		// Should see "Date Range" text from DateFilterContent
		await expect.element(getByText('Date Range')).toBeVisible();
	});
});
