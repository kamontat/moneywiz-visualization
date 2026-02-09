import type { ChartData } from 'chart.js'
import type {
	CategoryTotal,
	TopCategoryTotal,
} from '$lib/analytics/transforms/models'
import type { ParsedTransactionType } from '$lib/transactions/models'
import { getCategoryPalette } from '../theme'

export const toCategoryDoughnutData = (
	data: Record<ParsedTransactionType, CategoryTotal>,
	transactionType: ParsedTransactionType = 'Expense'
): ChartData<'doughnut'> => {
	const typeData = data[transactionType]
	if (!typeData) return { labels: [], datasets: [] }

	const parents = Object.entries(typeData.parents)
		.sort(([, a], [, b]) => Math.abs(b.total) - Math.abs(a.total))
		.slice(0, 10)

	const colors = getCategoryPalette(parents.length)

	return {
		labels: parents.map(([name]) => name),
		datasets: [
			{
				data: parents.map(([, parent]) => Math.abs(parent.total)),
				backgroundColor: colors,
				borderWidth: 2,
			},
		],
	}
}

export const toTopCategoriesBarData = (
	data: TopCategoryTotal[]
): ChartData<'bar'> => {
	const expenseData = data.find((d) => d.type === 'Expense')
	if (!expenseData) return { labels: [], datasets: [] }

	const topParents = Object.entries(expenseData.parents)
		.sort(([, a], [, b]) => Math.abs(b.total) - Math.abs(a.total))
		.slice(0, 8)

	const colors = getCategoryPalette(topParents.length)

	return {
		labels: topParents.map(([name]) => name),
		datasets: [
			{
				label: 'Amount',
				data: topParents.map(([, parent]) => Math.abs(parent.total)),
				backgroundColor: colors,
				borderWidth: 0,
			},
		],
	}
}
