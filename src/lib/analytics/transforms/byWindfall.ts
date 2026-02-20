import type { TransformBy, WindfallPoint } from './models'
import { formatDate } from '$lib/formatters/date'

export const byWindfall: TransformBy<WindfallPoint[]> = (trx) => {
	const map = new Map<string, { windfall: number; regularIncome: number }>()

	for (const t of trx) {
		const key = formatDate(t.date, 'YYYY-MM')
		if (!map.has(key)) {
			map.set(key, { windfall: 0, regularIncome: 0 })
		}

		const entry = map.get(key)
		if (!entry) continue

		switch (t.type) {
			case 'Windfall':
				entry.windfall += t.amount.value
				break
			case 'Income':
				entry.regularIncome += t.amount.value
				break
		}
	}

	return Array.from(map.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, entry]) => ({
			label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
			windfall: entry.windfall,
			regularIncome: entry.regularIncome,
		}))
}

byWindfall.type = 'byWindfall'
