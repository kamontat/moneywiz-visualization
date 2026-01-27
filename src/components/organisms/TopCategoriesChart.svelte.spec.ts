import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import TopCategoriesChart from './TopCategoriesChart.svelte';

describe('TopCategoriesChart.svelte', () => {
	const mockData = {
		items: [
			{ name: 'Food', value: 500 },
			{ name: 'Transport', value: 200 }
		],
		max: 500
	};

	it('renders heading', async () => {
		const { container } = page.render(TopCategoriesChart, { data: mockData });
		expect(container).toHaveTextContent('Top Categories');
	});

	it('renders list items for categories', async () => {
		const { container } = page.render(TopCategoriesChart, { data: mockData });
		const listItems = container.querySelectorAll('li');
		expect(listItems).toHaveLength(2);
		expect(container).toHaveTextContent('Food');
		expect(container).toHaveTextContent('Transport');
	});

	it('renders empty message when no items', async () => {
		const { container } = page.render(TopCategoriesChart, { data: { items: [], max: 0 } });
		expect(container).toHaveTextContent('No category data');
		expect(container.querySelector('ul')).toBeNull();
	});
});
