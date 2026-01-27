import { page } from 'vitest/browser';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LayoutTestWrapper from './LayoutTestWrapper.svelte';
import { csvStore } from '$lib/stores/csv';

describe('Layout.svelte', () => {
	beforeEach(() => {
		csvStore.reset();
		vi.clearAllMocks();
	});

	it('renders header and children content', async () => {
		const { getByText } = page.render(LayoutTestWrapper);

		// header
		expect(getByText('MoneyWiz Report')).toBeInTheDocument();

		// child content injected by wrapper
		expect(getByText('Test Content')).toBeInTheDocument();

		// Ensure AppHeader components are present (like Upload button)
		// Upload button default text might be "Upload CSV" or similar.
		// Let's verify presence of Upload button
		expect(getByText('Upload CSV', { exact: false })).toBeInTheDocument();
	});
});
