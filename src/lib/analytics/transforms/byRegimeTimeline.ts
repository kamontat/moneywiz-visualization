import type { RegimeSegment, TransformBy } from './models'
import { formatDate } from '$lib/formatters/date'

const regimeOf = (
	income: number,
	netCashFlow: number
): RegimeSegment['regime'] => {
	if (netCashFlow < 0) return 'Deficit'
	if (income <= 0) return 'Stressed'
	const ratio = netCashFlow / income
	if (ratio >= 0.2) return 'Stable'
	return 'Stressed'
}

export const byRegimeTimeline: TransformBy<RegimeSegment[]> = (trx) => {
	const map = new Map<string, { income: number; netCashFlow: number }>()

	for (const t of trx) {
		const key = formatDate(t.date, 'YYYY-MM')
		if (!map.has(key)) {
			map.set(key, { income: 0, netCashFlow: 0 })
		}

		const entry = map.get(key)
		if (!entry) continue

		switch (t.type) {
			case 'Income':
			case 'Windfall':
			case 'Sell':
			case 'DebtRepayment':
				entry.income += t.amount.value
				entry.netCashFlow += t.amount.value
				break
			case 'Expense':
			case 'Giveaway':
			case 'Debt':
			case 'Buy':
				entry.netCashFlow -= Math.abs(t.amount.value)
				break
			case 'Refund':
				entry.netCashFlow += t.amount.value
				break
		}
	}

	return Array.from(map.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, entry]) => {
			const ratio = entry.income === 0 ? 0 : entry.netCashFlow / entry.income
			return {
				label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
				income: entry.income,
				netCashFlow: entry.netCashFlow,
				ratio,
				regime: regimeOf(entry.income, entry.netCashFlow),
			}
		})
}

byRegimeTimeline.type = 'byRegimeTimeline'
