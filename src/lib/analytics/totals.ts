/**
 * Total calculations for financial data
 */

import { parseAmountTHB } from '../finance';

export interface Totals {
	income: number;
	expenses: number;
	net: number;
	count: number;
	savingRate: number;
}

/**
 * Calculate income, expenses, and net totals from THB rows
 */
export function calculateTotals(thbRows: Record<string, string>[]): Totals {
	let income = 0;
	let expenses = 0;
	for (const r of thbRows) {
		const amt = parseAmountTHB(r['Amount'] || '0');
		if (amt >= 0) income += amt;
		else expenses += amt; // negative
	}
	const net = income + expenses;

	// Saving Rate = (Income - Expense) / Income * 100
	// Note: Expenses are typically negative numbers in this system, so use Net (Income + Expenses)
	// If expenses are negative, Net is (100 + (-80)) = 20.
	// Saving Rate = (20 / 100) * 100 = 20%.

	let savingRate = 0;
	if (income > 0) {
		savingRate = (net / income) * 100;
	}

	return { income, expenses, net, count: thbRows.length, savingRate };
}
