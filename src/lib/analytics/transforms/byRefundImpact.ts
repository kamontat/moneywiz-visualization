import type { RefundImpactPoint, TransformBy } from './models'
import { formatDate } from '$lib/formatters/date'

export const byRefundImpact: TransformBy<RefundImpactPoint[]> = (trx) => {
	const map = new Map<string, Omit<RefundImpactPoint, 'label'>>()

	for (const t of trx) {
		const key = formatDate(t.date, 'YYYY-MM')
		if (!map.has(key)) {
			map.set(key, {
				grossExpense: 0,
				refund: 0,
				netExpense: 0,
			})
		}

		const entry = map.get(key)
		if (!entry) continue

		switch (t.type) {
			case 'Expense':
			case 'Giveaway':
			case 'Debt':
				entry.grossExpense += Math.abs(t.amount.value)
				break
			case 'Refund':
				entry.refund += t.amount.value
				break
		}

		entry.netExpense = entry.grossExpense - entry.refund
	}

	return Array.from(map.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, entry]) => ({
			label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
			...entry,
		}))
}

byRefundImpact.type = 'byRefundImpact'
