import type { OutlierPoint, TransformBy } from './models'
import { formatDate } from '$lib/formatters/date'

const windowSize = 30
const threshold = 2.5

const mean = (values: number[]): number => {
	if (values.length === 0) return 0
	return values.reduce((sum, value) => sum + value, 0) / values.length
}

const stddev = (values: number[]): number => {
	if (values.length === 0) return 0
	const avg = mean(values)
	const variance =
		values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length
	return Math.sqrt(variance)
}

export const byOutlierTimeline: TransformBy<OutlierPoint[]> = (trx) => {
	const dayMap = new Map<string, number>()

	for (const t of trx) {
		const day = formatDate(t.date, 'YYYY-MM-DD')
		const magnitude = Math.abs(t.amount.value)
		dayMap.set(day, (dayMap.get(day) ?? 0) + magnitude)
	}

	const values = Array.from(dayMap.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([day, value]) => ({ day, value }))

	return values.map((point, index) => {
		const start = Math.max(0, index - windowSize)
		const history = values.slice(start, index).map((p) => p.value)
		const baseline = mean(history)
		const sigma = stddev(history)
		const zScore = sigma === 0 ? 0 : (point.value - baseline) / sigma
		const isFlatHistoryAnomaly =
			history.length >= 7 && sigma === 0 && point.value !== baseline

		return {
			label: formatDate(new Date(point.day)),
			value: point.value,
			baseline,
			zScore,
			isOutlier:
				isFlatHistoryAnomaly ||
				(history.length >= 7 && Math.abs(zScore) >= threshold),
		}
	})
}

byOutlierTimeline.type = 'byOutlierTimeline'
