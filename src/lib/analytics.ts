/**
 * Analytics calculations for financial data
 */

import type { ParsedCsv } from './csv';
import { parseAmountTHB, parseDateDDMMYYYY } from './finance';
import { log } from './debug';

export interface Totals {
	income: number;
	expenses: number;
	net: number;
	count: number;
	savingRate: number;
}

export interface CategoryItem {
	name: string;
	value: number;
}

export interface TopCategoriesData {
	items: CategoryItem[];
	max: number;
}

export interface DailyItem {
	day: number;
	value: number;
}

export interface DailyExpensesData {
	items: DailyItem[];
	max: number;
	label: string;
}

/**
 * Filter rows to only THB currency transactions
 */
export function getTHBRows(data: ParsedCsv | null): Record<string, string>[] {
	if (!data) {
		log.pageDashboard('getTHBRows: no data');
		return [];
	}
	const rows = data.rows.filter((r) => (r['Currency'] || '').toUpperCase() === 'THB');
	log.pageDashboard('getTHBRows: filtered %d THB rows from %d total', rows.length, data.rows.length);
	return rows;
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

/**
 * Calculate top categories by total amount
 */
export function calculateTopCategories(thbRows: Record<string, string>[]): TopCategoriesData {
	const sums: Record<string, number> = {};
	for (const r of thbRows) {
		const cat = r['Category'] || 'Uncategorized';
		const amt = parseAmountTHB(r['Amount'] || '0');
		const absAmt = Math.abs(amt);
		sums[cat] = (sums[cat] || 0) + absAmt;
	}
	const items = Object.entries(sums)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([name, value]) => ({ name, value }));
	const max = items.reduce((m, it) => Math.max(m, it.value), 0);
	return { items, max };
}

/**
 * Calculate daily expenses for the most recent month
 */
export function calculateDailyExpenses(thbRows: Record<string, string>[]): DailyExpensesData {
	// Find latest date in THB rows
	const dates = thbRows
		.map((r) => parseDateDDMMYYYY(r['Date'] || ''))
		.filter((d): d is Date => d instanceof Date);
	if (dates.length === 0) return { items: [], max: 0, label: '' };

	const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
	const month = latest.getMonth();
	const year = latest.getFullYear();

	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const perDay: number[] = Array.from({ length: daysInMonth }, () => 0);

	for (const r of thbRows) {
		const d = parseDateDDMMYYYY(r['Date'] || '');
		if (!d || d.getMonth() !== month || d.getFullYear() !== year) continue;
		const amt = parseAmountTHB(r['Amount'] || '0');
		if (amt < 0) {
			const dayIdx = d.getDate() - 1;
			perDay[dayIdx] += Math.abs(amt);
		}
	}

	const max = perDay.reduce((m, v) => Math.max(m, v), 0);
	const items = perDay.map((v, i) => ({ day: i + 1, value: v }));
	const label = `${latest.toLocaleString(undefined, { month: 'long' })} ${year}`;
	return { items, max, label };
}

/**
 * Get the date range (min and max date) from transactions
 */
export function getDateRange(thbRows: Record<string, string>[]): { start: Date; end: Date } | null {
	const dates = thbRows
		.map((r) => parseDateDDMMYYYY(r['Date'] || ''))
		.filter((d): d is Date => d instanceof Date);

	if (dates.length === 0) return null;

	const start = new Date(Math.min(...dates.map((d) => d.getTime())));
	const end = new Date(Math.max(...dates.map((d) => d.getTime())));

	return { start, end };
}
