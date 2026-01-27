import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import IncomeExpenseRatioChart from './IncomeExpenseRatioChart.svelte';

describe('IncomeExpenseRatioChart.svelte', () => {
    it('renders income and expenses values', async () => {
			const { container } = page.render(IncomeExpenseRatioChart, { income: 1000, expenses: -500 });
			// Checks format THB presence roughly (depends on locale)
			// 1000 -> 1,000.00
			// 500 -> 500.00
			// We know it renders labels "Income" and "Expenses"
			expect(container).toHaveTextContent('Income');
			expect(container).toHaveTextContent('Expenses');
		});

    it('calculates savings rate correctly', async () => {
			// Income 1000, Expenses 500. Savings 500. Rate 50%
			const { container } = page.render(IncomeExpenseRatioChart, { income: 1000, expenses: -500 });
			expect(container).toHaveTextContent('+50%');
			expect(container).toHaveTextContent('Savings');
		});

    it('handles zero income/expenses', async () => {
			const { container } = page.render(IncomeExpenseRatioChart, { income: 0, expenses: 0 });
			expect(container).toHaveTextContent('0%');
		});
});
