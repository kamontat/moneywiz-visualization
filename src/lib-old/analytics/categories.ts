/**
 * Category analysis for financial data
 */

import { parseAmountTHB } from '../finance'

export interface CategoryItem {
	name: string
	value: number
}

export interface TopCategoriesData {
	items: CategoryItem[]
	max: number
}

export interface CategoryBreakdown {
	income: CategoryItem[]
	expenses: CategoryItem[]
}

/**
 * Calculate top categories by total amount
 */
export function calculateTopCategories(thbRows: Record<string, string>[]): TopCategoriesData {
	const sums: Record<string, number> = {}
	for (const r of thbRows) {
		const cat = r['Category'] || 'Uncategorized'
		const amt = parseAmountTHB(r['Amount'] || '0')
		const absAmt = Math.abs(amt)
		sums[cat] = (sums[cat] || 0) + absAmt
	}
	const items = Object.entries(sums)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([name, value]) => ({ name, value }))
	const max = items.reduce((m, it) => Math.max(m, it.value), 0)
	return { items, max }
}

/**
 * Calculate category breakdown for income and expenses
 */
export function calculateCategoryBreakdown(thbRows: Record<string, string>[]): CategoryBreakdown {
	const incomeSums: Record<string, number> = {}
	const expenseSums: Record<string, number> = {}

	for (const r of thbRows) {
		const cat = r['Category'] || 'Uncategorized'
		const amt = parseAmountTHB(r['Amount'] || '0')

		if (amt >= 0) {
			incomeSums[cat] = (incomeSums[cat] || 0) + amt
		} else {
			expenseSums[cat] = (expenseSums[cat] || 0) + Math.abs(amt)
		}
	}

	const income = Object.entries(incomeSums)
		.sort((a, b) => b[1] - a[1])
		.map(([name, value]) => ({ name, value }))

	const expenses = Object.entries(expenseSums)
		.sort((a, b) => b[1] - a[1])
		.map(([name, value]) => ({ name, value }))

	return { income, expenses }
}
