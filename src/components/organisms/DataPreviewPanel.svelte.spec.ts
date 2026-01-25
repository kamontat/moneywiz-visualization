import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DataPreviewPanel from './DataPreviewPanel.svelte';

describe('DataPreviewPanel.svelte', () => {
	const mockData = {
		headers: ['Name', 'Amount', 'Date'],
		rows: [
			{ Name: 'Item 1', Amount: '100', Date: '2023-01-01' },
			{ Name: 'Item 2', Amount: '200', Date: '2023-01-02' }
		]
	};

	it('renders correctly but collapsed by default', async () => {
		const { container } = render(DataPreviewPanel, { data: mockData });
		expect(container).toHaveTextContent('Data Preview');

		// Button should be visible
		const button = container.querySelector('button');
		expect(button).not.toBeNull();
		expect(button).toHaveAttribute('aria-expanded', 'false');

		// Content should be hidden
		const content = container.querySelector('#preview-content');
		expect(content).toBeNull();
	});

	it('expands table on click', async () => {
		const { container } = render(DataPreviewPanel, { data: mockData });
		const button = container.querySelector('button');

		if (button instanceof HTMLElement) {
			button.click();
		}

		// Wait for DOM update
		await new Promise(resolve => setTimeout(resolve, 10));

		const content = container.querySelector('#preview-content');
		expect(content).not.toBeNull();
		expect(content).toHaveTextContent('Item 1');
		expect(content).toHaveTextContent('Item 2');
	});

	it('renders table headers correctly', async () => {
		const { container } = render(DataPreviewPanel, { data: mockData });
		const button = container.querySelector('button');

		if (button instanceof HTMLElement) {
			button.click();
		}
		await new Promise(resolve => setTimeout(resolve, 10));

		const ths = container.querySelectorAll('th');
		expect(ths).toHaveLength(3);
		expect(ths[0]).toHaveTextContent('Name');
		expect(ths[2]).toHaveTextContent('Date');
	});

	it('shows "no rows" message if data has no rows', async () => {
		const emptyData = { headers: ['Col1'], rows: [] };
		const { container } = render(DataPreviewPanel, { data: emptyData });

		const button = container.querySelector('button');
		if (button instanceof HTMLElement) {
			button.click();
		}
		await new Promise(resolve => setTimeout(resolve, 10));

		const content = container.querySelector('#preview-content');
		expect(content).toHaveTextContent('No data rows found');
	});

	it('renders nothing if data is null', async () => {
		const { container } = render(DataPreviewPanel, { data: null });
		// Svelte may leave comment nodes, but there should be no elements
		expect(container.childElementCount).toBe(0);
		expect(container).toHaveTextContent('');
	});
});
