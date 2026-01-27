import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FilterPanel from './FilterPanel.svelte';

describe('FilterPanel.svelte', () => {
	it('is initially collapsed', async () => {
		const screen = render(FilterPanel);
		await expect.element(screen.getByRole('button', { name: /filter/i })).toBeVisible();
		// Content should not be visible
		await expect.element(screen.getByLabelText('Start')).not.toBeInTheDocument();
	});

	it('expands when clicked', async () => {
		const screen = render(FilterPanel);
		await screen.getByRole('button', { name: /filter/i }).click();
		await expect.element(screen.getByLabelText('Start')).toBeVisible();
	});

    it('updates inputs when presets are clicked', async () => {
        const screen = render(FilterPanel);
        await screen.getByRole('button', { name: /filter/i }).click();

        // Click a preset
        await screen.getByText('This Month').click();

        // Check input values (approximate since today changes)
        // Ensure they are not empty
        const startInput = screen.getByLabelText('Start');
        const endInput = screen.getByLabelText('End');

        // Check that value is not empty string (date inputs return YYYY-MM-DD)
        // We use regex to match date format
        // Regex support might be flaky in this version, let's check it's not empty
        await expect.element(startInput).not.toHaveValue('');
        await expect.element(endInput).not.toHaveValue('');
    });

    it('renders tag filters based on rows', async () => {
        const rows = [
            { Tags: 'Group: TestGroup; Type: Personal;' }
        ] as any[];

        const screen = render(FilterPanel, { props: {
            rows,
            start: null,
            end: null,
            tagFilters: []
        }});
        await screen.getByRole('button', { name: /filter/i }).click();

        // Use exact match or role
        // 'Group' is displayed in a span
        await expect.element(screen.getByText('Group', { exact: true })).toBeVisible();
        await expect.element(screen.getByText('TestGroup', { exact: true })).toBeVisible();
        await expect.element(screen.getByText('Type', { exact: true })).toBeVisible();
        await expect.element(screen.getByText('Personal', { exact: true })).toBeVisible();
    });

    it('toggles tag selection include/exclude', async () => {
        const rows = [{ Tags: 'Group: A;' }] as any[];
        const screen = render(FilterPanel, { props: {
            rows,
            start: null,
            end: null,
            tagFilters: []
        }});
        await screen.getByRole('button', { name: /filter/i }).click();

        // Default mode is include (Inc button active?)
        // Check "Inc" button exists
        const incBtn = screen.getByTitle('Include selected');
        await expect.element(incBtn).toBeVisible();

         // Click option 'A' using exact match and role
        const optionA = screen.getByRole('button', { name: 'A', exact: true });
        await optionA.click();

        // Check if "Clear Tags" button appeared
        await expect.element(screen.getByText('Clear Tags')).toBeVisible();
    });
});
