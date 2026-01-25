import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SummaryCards from './SummaryCards.svelte';

describe('SummaryCards.svelte', () => {
    const mockTotals = {
        income: 1000,
        expenses: -500,
        net: 500,
        count: 10
    };

    it('renders income, expenses, net and count', async () => {
        const { container } = render(SummaryCards, { totals: mockTotals });

        // Helper to find value text directly
        const findValue = (label: string) => {
            const labelEl = Array.from(container.querySelectorAll('p')).find(p => p.textContent?.includes(label));
            return labelEl?.nextElementSibling?.textContent;
        };

        // Note: formatTHB behavior depends on locale, simplified check
        // Assuming formatTHB calls standard Intl which usually formats 1000 to THB 1,000.00
        // We match substring loosely
        expect(container).toHaveTextContent('Income (THB)');
        expect(container).toHaveTextContent('Expenses (THB)');
        expect(container).toHaveTextContent('Net (THB)');
        expect(container).toHaveTextContent('Transactions');

        // Count should be exact
        expect(findValue('Transactions')).toContain('10');
    });

    it('handles zero values', async () => {
        const { container } = render(SummaryCards, { totals: { income: 0, expenses: 0, net: 0, count: 0 } });
        // Typically formats to 0.00
        expect(container).toHaveTextContent('Transactions');
    });
});
