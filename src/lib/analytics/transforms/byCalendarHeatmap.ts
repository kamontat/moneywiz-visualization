import type { CalendarCell, TransformBy } from './models'
import { formatDate } from '$lib/formatters/date'

const oneDayMs = 24 * 60 * 60 * 1000

export const byCalendarHeatmap: TransformBy<CalendarCell[]> = (trx) => {
	const dayMap = new Map<string, number>()

	for (const t of trx) {
		const day = formatDate(t.date, 'YYYY-MM-DD')
		const current = dayMap.get(day) ?? 0

		switch (t.type) {
			case 'Income':
			case 'Windfall':
			case 'Sell':
			case 'DebtRepayment':
				dayMap.set(day, current + t.amount.value)
				break
			case 'Expense':
			case 'Giveaway':
			case 'Debt':
			case 'Buy':
				dayMap.set(day, current - Math.abs(t.amount.value))
				break
			case 'Refund':
				dayMap.set(day, current + t.amount.value)
				break
		}
	}

	const entries = Array.from(dayMap.entries()).sort(([a], [b]) =>
		a.localeCompare(b)
	)
	const maxAbs = entries.reduce(
		(m, [, value]) => Math.max(m, Math.abs(value)),
		0
	)

	if (entries.length === 0) return []

	const firstDate = new Date(entries[0][0])
	const start = new Date(firstDate)
	start.setDate(firstDate.getDate() - firstDate.getDay())

	return entries.map(([day, value]) => {
		const date = new Date(day)
		const diffDays = Math.floor((date.getTime() - start.getTime()) / oneDayMs)
		const x = Math.floor(diffDays / 7)
		const y = date.getDay()
		const ratio = maxAbs === 0 ? 0 : Math.abs(value) / maxAbs
		const bucket = Math.min(4, Math.floor(ratio * 5))

		return {
			x,
			y,
			day,
			value,
			bucket,
		}
	})
}

byCalendarHeatmap.type = 'byCalendarHeatmap'
