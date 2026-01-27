import { render } from 'vitest-browser-svelte';
import ExpenseByCategory from './ExpenseByCategory.svelte';
import { describe, it, expect } from 'vitest';

describe('ExpenseByCategory', () => {
    it('renders expense items correctly as negative values', async () => {
        const items = [
            { name: 'Food', value: 200 },
            { name: 'Transport', value: 100 }
        ];
        const total = -300; // Passed as total logic from analytics (expenses are negative sum)

        const screen = render(ExpenseByCategory, { props: { items, total } });

        await expect.element(screen.getByText('Expenses by Category')).toBeVisible();

        // Expand
        await screen.getByRole('button').click();

        await expect.element(screen.getByText('Food')).toBeVisible();
        await expect.element(screen.getByText('-฿200.00')).toBeVisible();
        expect(screen.getByText('66.7%')).toBeTruthy();
    });

    it('renders empty state', async () => {
         const screen = render(ExpenseByCategory, { props: { items: [], total: 0 } });

         // Expand
         await screen.getByRole('button').click();

         await expect.element(screen.getByText('No expenses data')).toBeVisible();
    });
});
