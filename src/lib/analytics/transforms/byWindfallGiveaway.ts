import type { TransformBy, WindfallGiveawayPoint } from './models'
import { formatDate } from '$lib/formatters/date'

export const byWindfallGiveaway: TransformBy<WindfallGiveawayPoint[]> = (
	trx
) => {
	const map = new Map<string, { windfall: number; giveaway: number }>()

	for (const t of trx) {
		const key = formatDate(t.date, 'YYYY-MM')
		if (!map.has(key)) {
			map.set(key, { windfall: 0, giveaway: 0 })
		}

		const entry = map.get(key)
		if (!entry) continue

		switch (t.type) {
			case 'Windfall':
				entry.windfall += t.amount.value
				break
			case 'Giveaway':
				entry.giveaway += Math.abs(t.amount.value)
				break
		}
	}

	return Array.from(map.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, entry]) => ({
			label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
			windfall: entry.windfall,
			giveaway: entry.giveaway,
		}))
}

byWindfallGiveaway.type = 'byWindfallGiveaway'
