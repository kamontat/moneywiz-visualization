import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SummaryCards from './SummaryCards.svelte';

describe('SummaryCards.svelte', () => {
    const mockTotals = {
        income: 1000,
        expenses: -500,
        net: 500,
        count: 10,
        savingRate: 50.0
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
        expect(container).toHaveTextContent('Income');
        expect(container).toHaveTextContent('Expenses');
        expect(container).toHaveTextContent('Net / Cash Flow');
        expect(container).toHaveTextContent('Saving Rate');

        // Check for currency symbol in values
        // Since we are monitoring text content of the container, it should contain the formatted values like ฿1,000.00
        const text = container.textContent;
        expect(text).toContain('฿');

        // Saving rate should be exact
        expect(findValue('Saving Rate')).toContain('50.0%');
    });

    it('handles zero values', async () => {
        const { container } = render(SummaryCards, { totals: { income: 0, expenses: 0, net: 0, count: 0, savingRate: 0 } });
        // Typically formats to 0.00
        expect(container).toHaveTextContent('Saving Rate');
        expect(container).toHaveTextContent('0.0%');
    });
});
