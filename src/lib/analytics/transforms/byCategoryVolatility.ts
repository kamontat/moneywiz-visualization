import type { CategoryVolatilityPoint, TransformBy } from './models'
import { formatDate } from '$lib/formatters/date'

const stddev = (values: number[]): number => {
	if (values.length === 0) return 0
	const mean = values.reduce((s, v) => s + v, 0) / values.length
	const variance =
		values.reduce((s, v) => s + (v - mean) * (v - mean), 0) / values.length
	return Math.sqrt(variance)
}

export const byCategoryVolatility: TransformBy<CategoryVolatilityPoint[]> = (
	trx
) => {
	const categoryMonthMap = new Map<string, Map<string, number>>()

	for (const t of trx) {
		if (t.type !== 'Expense' && t.type !== 'Giveaway' && t.type !== 'Debt') {
			continue
		}
		if (!('category' in t)) continue

		const category = t.category.category.trim() || 'Uncategorized'
		const month = formatDate(t.date, 'YYYY-MM')

		if (!categoryMonthMap.has(category)) {
			categoryMonthMap.set(category, new Map())
		}
		const monthMap = categoryMonthMap.get(category)
		if (!monthMap) continue
		monthMap.set(month, (monthMap.get(month) ?? 0) + Math.abs(t.amount.value))
	}

	return Array.from(categoryMonthMap.entries())
		.map(([category, monthMap]) => {
			const monthly = Array.from(monthMap.values())
			const mean =
				monthly.length === 0
					? 0
					: monthly.reduce((sum, v) => sum + v, 0) / monthly.length
			const sigma = stddev(monthly)
			const cov = mean === 0 ? 0 : sigma / mean

			return {
				category,
				mean,
				stddev: sigma,
				cov,
				months: monthly.length,
			}
		})
		.sort((a, b) => b.cov - a.cov)
		.slice(0, 30)
}

byCategoryVolatility.type = 'byCategoryVolatility'
