import type { StatsRange } from '../../models'
import { formatDate } from '$lib/formatters/date'

const oneDayMs = 24 * 60 * 60 * 1000

export const toDaysInclusive = (start: Date, end: Date): number => {
	const startMs = new Date(start).setHours(0, 0, 0, 0)
	const endMs = new Date(end).setHours(0, 0, 0, 0)
	return Math.max(1, Math.floor((endMs - startMs) / oneDayMs) + 1)
}

export const toRange = (start: Date, end: Date): StatsRange => {
	const normalizedStart = new Date(start)
	normalizedStart.setHours(0, 0, 0, 0)
	const normalizedEnd = new Date(end)
	normalizedEnd.setHours(23, 59, 59, 999)

	const startLabel = formatDate(normalizedStart)
	const endLabel = formatDate(normalizedEnd)

	return {
		start: normalizedStart,
		end: normalizedEnd,
		days: toDaysInclusive(normalizedStart, normalizedEnd),
		label: startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`,
	}
}
