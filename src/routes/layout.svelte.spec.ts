import { createRawSnippet } from 'svelte';
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
        const { container } = render(Layout, { props: { children: createRawSnippet(() => { return { render: () => '' }}) } });

        // header
        expect(container).toHaveTextContent('MoneyWiz Report');
        // blank canvas (no error, no data)
        expect(container.querySelector('.blank-canvas')).toBeInTheDocument();
        // preview section should not be visible
        expect(container).not.toHaveTextContent('Upload successful');
        expect(container).not.toHaveTextContent('Show Preview');
    });
});
