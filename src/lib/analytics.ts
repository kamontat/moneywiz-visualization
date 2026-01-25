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

export interface CategoryBreakdown {
	income: CategoryItem[];
	expenses: CategoryItem[];
}

export interface TagFilter {
	category: string;
	values: string[];
	mode: 'include' | 'exclude';
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

/**
 * Calculate category breakdown for income and expenses
 */
export function calculateCategoryBreakdown(thbRows: Record<string, string>[]): CategoryBreakdown {
	const incomeSums: Record<string, number> = {};
	const expenseSums: Record<string, number> = {};

	for (const r of thbRows) {
		const cat = r['Category'] || 'Uncategorized';
		const amt = parseAmountTHB(r['Amount'] || '0');

		if (amt >= 0) {
			incomeSums[cat] = (incomeSums[cat] || 0) + amt;
		} else {
			expenseSums[cat] = (expenseSums[cat] || 0) + Math.abs(amt);
		}
	}

	const income = Object.entries(incomeSums)
		.sort((a, b) => b[1] - a[1])
		.map(([name, value]) => ({ name, value }));

	const expenses = Object.entries(expenseSums)
		.sort((a, b) => b[1] - a[1])
		.map(([name, value]) => ({ name, value }));

	return { income, expenses };
}

/**
 * Filter rows by date range (inclusive)
 * @param rows The parsed CSV rows
 * @param start Start date (null = no start limit)
 * @param end End date (null = no end limit)
 */
export function filterByDateRange(
	rows: Record<string, string>[],
	start: Date | null,
	end: Date | null
): Record<string, string>[] {
	if (!start && !end) return rows;

	return rows.filter((row) => {
		const dateStr = row['Date'];
		if (!dateStr) return false;

		const date = parseDateDDMMYYYY(dateStr);
		if (!date) return false;

		// Normalize times to start of day for accurate comparison
		// Or keep time if desired, but typically filters are day-inclusive
		// Let's assume input dates are already handled or we just compare timestamps naturally.
		// Usually for "End Date" we want it to be end of that day.
		// But for now let's just do simple comparison.

		if (start && date < start) return false;
		if (end && date > end) return false;

		return true;
	});
}

/**
 * Parse tags from a single Tags field string.
 * Format: "Category: Value; Category2: Value2; "
 */
export function parseTagsFromField(tagsField: string): Record<string, string> {
	if (!tagsField) return {};

	const tags: Record<string, string> = {};
	const parts = tagsField.split(';').map((p) => p.trim()).filter((p) => p.length > 0);

	for (const part of parts) {
		const [category, ...valueParts] = part.split(':');
		if (category && valueParts.length > 0) {
			const cat = category.trim();
			const val = valueParts.join(':').trim(); // Rejoin in case value contains colons
			if (cat && val) {
				tags[cat] = val;
			}
		}
	}

	return tags;
}

/**
 * Extract all unique tag categories and their values from the dataset.
 */
export function parseAllTags(rows: Record<string, string>[]): Map<string, Set<string>> {
	const allTags = new Map<string, Set<string>>();

	for (const row of rows) {
		const tagsStr = row['Tags'];
		if (!tagsStr) continue;

		const tags = parseTagsFromField(tagsStr);
		for (const [category, value] of Object.entries(tags)) {
			if (!allTags.has(category)) {
				allTags.set(category, new Set());
			}
			allTags.get(category)?.add(value);
		}
	}

	return allTags;
}

/**
 * Filter rows by tag filters.
 * Multiple filters combine with AND logic (row must pass all filters).
 * For a single category filter:
 * - Include mode: Row must have AT LEAST ONE of the selected values.
 * - Exclude mode: Row must NOT have ANY of the selected values.
 */
export function filterByTags(
	rows: Record<string, string>[],
	filters: TagFilter[]
): Record<string, string>[] {
	if (!filters || filters.length === 0) return rows;

	return rows.filter((row) => {
		const rowTags = parseTagsFromField(row['Tags'] || '');

		for (const filter of filters) {
			const { category, values, mode } = filter;
			if (values.length === 0) continue; // No values selected = no filter for this category

			const rowTagValue = rowTags[category];

			if (mode === 'include') {
				// Must have the tag category AND value must be in selected values
				if (!rowTagValue) return false;
				if (!values.includes(rowTagValue)) return false;
			} else if (mode === 'exclude') {
				// If row has the tag category AND value is in selected values, reject it
				if (rowTagValue && values.includes(rowTagValue)) return false;
			}
		}

		return true;
	});
}
