import type { GiveawayPoint, TransformBy } from './models'
import { formatDate } from '$lib/formatters/date'

export const byGiveaway: TransformBy<GiveawayPoint[]> = (trx) => {
	const map = new Map<string, { giveaway: number; regularExpense: number }>()

	for (const t of trx) {
		const key = formatDate(t.date, 'YYYY-MM')
		if (!map.has(key)) {
			map.set(key, { giveaway: 0, regularExpense: 0 })
		}

		const entry = map.get(key)
		if (!entry) continue

		switch (t.type) {
			case 'Giveaway':
				entry.giveaway += Math.abs(t.amount.value)
				break
			case 'Expense':
				entry.regularExpense += Math.abs(t.amount.value)
				break
		}
	}

	return Array.from(map.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, entry]) => ({
			label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
			giveaway: entry.giveaway,
			regularExpense: entry.regularExpense,
		}))
}

byGiveaway.type = 'byGiveaway'
