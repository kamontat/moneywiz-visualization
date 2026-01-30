import type { TransformBy, TransformByFunc } from './models'
import type { ParsedTransaction } from '$lib/transactions'
import { bySummarize } from './bySummarize'
import { transform } from './transform'

import { formatDate } from '$lib/formatters/date'

export interface TimeSeriesPoint {
	date: Date
	income: number
	expense: number
	net: number
	label: string
}

export type TimeSeriesMode = 'Daily' | 'Monthly'

export interface TimeSeries {
	mode: TimeSeriesMode
	points: TimeSeriesPoint[]
}

export const byTimeSeries: TransformByFunc<[Date | null, Date | null], TimeSeries> = (
	start,
	end
) => {
	const by: TransformBy<TimeSeries> = (trx) => {
		const mode = getMode(trx, start, end)
		const map = new Map<string, TimeSeriesPoint>()

		for (const t of trx) {
			const key = getKey(mode, t.date)
			if (!map.has(key)) {
				map.set(key, { date: t.date, income: 0, expense: 0, net: 0, label: getLabel(mode, t.date) })
			}
			const entry = map.get(key)!
			if (t.type === 'Income') entry.income += t.amount.value
			if (t.type === 'Expense') entry.expense += t.amount.value
			// TODO: Depends on how expense is stored, if negative value then use +, else use -
			entry.net = entry.income - Math.abs(entry.expense)
		}

		const points: TimeSeriesPoint[] = []
		const sortedKeys = Array.from(map.keys()).sort()
		for (const k of sortedKeys) {
			const entry = map.get(k)
			if (entry) {
				points.push(entry)
			}
		}

		return {
			mode,
			points,
		}
	}
	by.type = 'byTimeSeries'
	return by
}

const getMode = (
	trx: ParsedTransaction[],
	start: Date | null,
	end: Date | null
): TimeSeriesMode => {
	if (trx.length < 50) return 'Daily'
	else if (start === null && end === null) return 'Monthly'

	const { dateRange } = transform(trx, bySummarize())
	if (start === null) start = dateRange.start
	if (end === null) end = dateRange.end

	const diffTime = Math.abs(end.getTime() - start.getTime())
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	if (diffDays <= 35) return 'Daily'
	else return 'Monthly'
}

const getKey = (mode: TimeSeriesMode, date: Date) => {
	switch (mode) {
		case 'Monthly':
			return formatDate(date, 'YYYY-MM')
		case 'Daily':
			return formatDate(date, 'YYYY-MM-DD')
	}
}

const getLabel = (mode: TimeSeriesMode, date: Date) => {
	switch (mode) {
		case 'Monthly':
			return formatDate(date, 'MMM YYYY')
		case 'Daily':
			return formatDate(date)
	}
}
