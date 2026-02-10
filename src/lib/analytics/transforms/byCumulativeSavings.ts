import type {
	CumulativeSavingsPoint,
	TransformBy,
	TransformByFunc,
} from './models'
import { formatDate } from '$lib/formatters/date'

export const byCumulativeSavings: TransformByFunc<
	[number],
	CumulativeSavingsPoint[]
> = (monthlyTarget) => {
	const by: TransformBy<CumulativeSavingsPoint[]> = (trx) => {
		const monthMap = new Map<string, number>()

		for (const t of trx) {
			const key = formatDate(t.date, 'YYYY-MM')
			const current = monthMap.get(key) ?? 0

			switch (t.type) {
				case 'Income':
				case 'Windfall':
				case 'Sell':
				case 'DebtRepayment':
					monthMap.set(key, current + t.amount.value)
					break
				case 'Expense':
				case 'Giveaway':
				case 'Debt':
				case 'Buy':
					monthMap.set(key, current - Math.abs(t.amount.value))
					break
				case 'Refund':
					monthMap.set(key, current + t.amount.value)
					break
			}
		}

		let cumulative = 0
		let target = 0
		return Array.from(monthMap.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, net]) => {
				cumulative += net
				target += monthlyTarget

				return {
					label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
					net,
					cumulative,
					target,
				}
			})
	}

	by.type = 'byCumulativeSavings'
	return by
}
