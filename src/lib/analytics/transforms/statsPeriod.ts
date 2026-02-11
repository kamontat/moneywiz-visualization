import type { StatsRange } from './models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { formatDate } from '$lib/formatters/date'

const oneDayMs = 24 * 60 * 60 * 1000

const toStartOfDay = (value: Date): Date => {
	const date = new Date(value)
	date.setHours(0, 0, 0, 0)
	return date
}

const toEndOfDay = (value: Date): Date => {
	const date = new Date(value)
	date.setHours(23, 59, 59, 999)
	return date
}

const getDaysInclusive = (start: Date, end: Date): number => {
	const diff = toStartOfDay(end).getTime() - toStartOfDay(start).getTime()
	return Math.max(1, Math.floor(diff / oneDayMs) + 1)
}

const toRangeLabel = (start: Date, end: Date): string => {
	const startLabel = formatDate(start)
	const endLabel = formatDate(end)
	if (startLabel === endLabel) return startLabel
	return `${startLabel} - ${endLabel}`
}

const toStatsRange = (start: Date, end: Date): StatsRange => {
	const normalizedStart = toStartOfDay(start)
	const normalizedEnd = toEndOfDay(end)
	return {
		start: normalizedStart,
		end: normalizedEnd,
		days: getDaysInclusive(normalizedStart, normalizedEnd),
		label: toRangeLabel(normalizedStart, normalizedEnd),
	}
}

const getDataBounds = (
	transactions: ParsedTransaction[]
): { start: Date; end: Date } | null => {
	if (transactions.length === 0) return null

	let start = transactions[0].date
	let end = transactions[0].date

	for (const transaction of transactions) {
		if (transaction.date < start) start = transaction.date
		if (transaction.date > end) end = transaction.date
	}

	return {
		start,
		end,
	}
}

export const deriveCurrentRange = (
	transactions: ParsedTransaction[],
	explicitStart?: Date,
	explicitEnd?: Date,
	autoWindowDays = 30
): StatsRange | null => {
	const bounds = getDataBounds(transactions)

	if (explicitStart || explicitEnd) {
		if (!explicitStart && !explicitEnd) return null

		let start = explicitStart ?? bounds?.start ?? explicitEnd
		let end = explicitEnd ?? bounds?.end ?? explicitStart

		if (!start || !end) return null
		if (start.getTime() > end.getTime()) {
			const temp = start
			start = end
			end = temp
		}

		return toStatsRange(start, end)
	}

	if (!bounds) return null

	const end = toEndOfDay(bounds.end)
	const start = new Date(end)
	start.setDate(start.getDate() - Math.max(1, autoWindowDays) + 1)

	return toStatsRange(start, end)
}

export const deriveBaselineRange = (
	currentRange: StatsRange | null
): StatsRange | null => {
	if (!currentRange) return null

	const end = new Date(currentRange.start)
	end.setDate(end.getDate() - 1)
	const normalizedEnd = toEndOfDay(end)

	const start = new Date(normalizedEnd)
	start.setDate(start.getDate() - currentRange.days + 1)
	const normalizedStart = toStartOfDay(start)

	return toStatsRange(normalizedStart, normalizedEnd)
}

export const sliceByDateRange = (
	transactions: ParsedTransaction[],
	range: StatsRange | null
): ParsedTransaction[] => {
	if (!range) return []

	return transactions.filter(
		(transaction) =>
			transaction.date.getTime() >= range.start.getTime() &&
			transaction.date.getTime() <= range.end.getTime()
	)
}
