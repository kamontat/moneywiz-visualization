import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import TagCategoryContent from './TagCategoryContent.svelte';

describe('TagCategoryContent', () => {
	it('renders options', async () => {
		const { getByText } = page.render(TagCategoryContent, {
			props: {
				category: 'Bank',
				availableValues: ['KBank', 'SCB'],
				tagFilters: []
			}
		});

		await expect.element(getByText('KBank')).toBeVisible();
		await expect.element(getByText('SCB')).toBeVisible();
	});
});
