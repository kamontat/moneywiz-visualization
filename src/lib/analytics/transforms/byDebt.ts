import type { DebtMonthPoint, TransformBy } from './models'
import { formatDate } from '$lib/formatters/date'

export const byDebt: TransformBy<DebtMonthPoint[]> = (trx) => {
	const map = new Map<string, { taken: number; repaid: number }>()

	for (const t of trx) {
		const key = formatDate(t.date, 'YYYY-MM')
		if (!map.has(key)) {
			map.set(key, { taken: 0, repaid: 0 })
		}

		const entry = map.get(key)
		if (!entry) continue

		switch (t.type) {
			case 'Debt':
				entry.taken += Math.abs(t.amount.value)
				break
			case 'DebtRepayment':
				entry.repaid += Math.abs(t.amount.value)
				break
		}
	}

	return Array.from(map.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, entry]) => ({
			label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
			taken: entry.taken,
			repaid: entry.repaid,
			netDebt: entry.taken - entry.repaid,
		}))
}

byDebt.type = 'byDebt'
