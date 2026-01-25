import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Layout from './+layout.svelte';
import { csvStore } from '$lib/stores/csv';

describe('Layout.svelte', () => {
    beforeEach(() => {
        csvStore.reset();
        vi.clearAllMocks();
    });

    it('renders header and blank canvas initially', async () => {
        const { container } = render(Layout, { props: { children: () => {} } }); // children snippet
        // We probably need to provide a snippet for children.
        // In Svelte 5 snippets are passed as props.
        // But vitest-browser-svelte render might handle slots/snippets differently.
        // Assuming no children for now or just empty.

        expect(container).toHaveTextContent('MoneyWiz Report');
        expect(container.querySelector('.blank-canvas')).toBeInTheDocument();
        expect(container).not.toHaveTextContent('Upload successful');
    });
});
