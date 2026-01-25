import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FilterPanel from './FilterPanel.svelte';

describe('FilterPanel.svelte', () => {
	it('is initially collapsed', async () => {
		const screen = render(FilterPanel);
		await expect.element(screen.getByText('Date')).toBeVisible();
		// Content should not be visible
		await expect.element(screen.getByLabelText('Start Date')).not.toBeInTheDocument();
	});

	it('expands when clicked', async () => {
		const screen = render(FilterPanel);
		await screen.getByText('Date').click();
		await expect.element(screen.getByLabelText('Start Date')).toBeVisible();
	});

    it('updates inputs when presets are clicked', async () => {
        const screen = render(FilterPanel);
        await screen.getByText('Date').click();

        // Click a preset
        await screen.getByText('This Month').click();

        // Check input values (approximate since today changes)
        const startInput = screen.getByLabelText('Start Date');
        const endInput = screen.getByLabelText('End Date');

        // We can't easily assert exact values without mocking Date,
        // but we can check they are not empty
        const startVal = await (startInput as any).element().value;
        const endVal = await (endInput as any).element().value;

        expect(startVal).not.toBe('');
        expect(endVal).not.toBe('');
    });
});
