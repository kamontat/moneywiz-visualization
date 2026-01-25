import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CategoryBreakdown from './CategoryBreakdown.svelte';

describe('CategoryBreakdown.svelte', () => {
	const mockBreakdown = {
		income: [{ name: 'Salary', value: 2000 }],
		expenses: [
			{ name: 'Food', value: 100 },
			{ name: 'Rent', value: 500 }
		]
	};
	const mockTotals = {
		income: 2000,
		expenses: -600,
		net: 1400,
		count: 5,
		savingRate: 70
	};

	it('renders collapsed by default', async () => {
		const { container } = render(CategoryBreakdown, { breakdown: mockBreakdown, totals: mockTotals });
		expect(container).toHaveTextContent('Income by Category');
		expect(container).toHaveTextContent('Expenses by Category');

		// Check lists are not present
		expect(container.querySelector('#income-breakdown')).toBeNull();
		expect(container.querySelector('#expense-breakdown')).toBeNull();
	});

	it('expands income panel on click', async () => {
		const { container } = render(CategoryBreakdown, { breakdown: mockBreakdown, totals: mockTotals });

		const incomeBtn = container.querySelector('button[aria-controls="income-breakdown"]');
		expect(incomeBtn).not.toBeNull();

		// Click to expand
		if (incomeBtn instanceof HTMLElement) {
			incomeBtn.click();
		}

		// Wait for update? Svelte 5 runes usually react synchronously in simple cases or testing-library handles it?
		// We might need to wait for DOM update.
		// Since we don't have existing async utilities imported, we try direct assertion.
		// If it fails, we know we need `await tick()` or `waitFor`.
		// But `tick` comes from `svelte`.

		// In vitest-browser-svelte, render runs in browser environment (mostly).
        // Let's rely on standard expect. If list is not there immediately, we'll see.
        // Actually, without an `await` for the framework to update the DOM, this might fail.
        // But `HTMLElement.click()` is synchronous event dispatch. Svelte updates might be microtask.
        await new Promise(resolve => setTimeout(resolve, 10));

		const incomeList = container.querySelector('#income-breakdown');
		expect(incomeList).not.toBeNull();
		expect(incomeList).toHaveTextContent('Salary');
	});

    it('expands expense panel on click', async () => {
		const { container } = render(CategoryBreakdown, { breakdown: mockBreakdown, totals: mockTotals });

		const expenseBtn = container.querySelector('button[aria-controls="expense-breakdown"]');
        if (expenseBtn instanceof HTMLElement) {
			expenseBtn.click();
		}
        await new Promise(resolve => setTimeout(resolve, 10));

		const expenseList = container.querySelector('#expense-breakdown');
		expect(expenseList).not.toBeNull();
		expect(expenseList).toHaveTextContent('Food');
        expect(expenseList).toHaveTextContent('Rent');
	});
});
