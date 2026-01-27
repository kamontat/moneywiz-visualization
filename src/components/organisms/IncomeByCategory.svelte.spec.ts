import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import IncomeByCategory from './IncomeByCategory.svelte';

describe('IncomeByCategory', () => {
    // Basic rendering test
    it('renders income items correctly', async () => {
        const items = [
            { name: 'Salary', value: 50000 },
            { name: 'Bonus', value: 10000 }
        ];
        const total = 60000;

        const screen = page.render(IncomeByCategory, { props: { items, total } });

        await expect.element(screen.getByText('Income by Category')).toBeVisible();

        // Expand
        await screen.getByRole('button').click();

        await expect.element(screen.getByText('Salary')).toBeVisible();
        await expect.element(screen.getByText('+฿50,000.00')).toBeVisible();
        await expect.element(screen.getByText('83.3%')).toBeVisible(); // 50000/60000
    });

    it('renders empty state', async () => {
         const screen = page.render(IncomeByCategory, { props: { items: [], total: 0 } });

         // Expand
         await screen.getByRole('button').click();

         await expect.element(screen.getByText('No income data')).toBeVisible();
    });
});
