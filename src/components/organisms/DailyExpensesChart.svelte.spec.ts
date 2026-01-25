import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DailyExpensesChart from './DailyExpensesChart.svelte';

describe('DailyExpensesChart.svelte', () => {
    const mockData = {
        items: [
            { day: 1, value: 100 },
            { day: 2, value: 50 },
            { day: 3, value: 200 }
        ],
        max: 200,
        label: 'January 2023'
    };

    it('renders heading with label', async () => {
        const { container } = render(DailyExpensesChart, { data: mockData });
        expect(container).toHaveTextContent('Daily Expenses — January 2023');
    });

    it('renders bars (rects) for items', async () => {
        const { container } = render(DailyExpensesChart, { data: mockData });
        const rects = container.querySelectorAll('rect');
        expect(rects).toHaveLength(3);
    });

    it('renders empty message when no items', async () => {
        const { container } = render(DailyExpensesChart, { data: { items: [], max: 0, label: '' } });
        expect(container).toHaveTextContent('No daily data');
        expect(container.querySelector('svg')).toBeNull();
    });
});
