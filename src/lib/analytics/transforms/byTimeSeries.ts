import type {
	TimeSeries,
	TimeSeriesMode,
	TimeSeriesPoint,
	TransformBy,
	TransformByFunc,
} from './models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { bySummarize } from './bySummarize'
import { transform } from './transform'

import { formatDate } from '$lib/formatters/date'

export const byTimeSeries: TransformByFunc<
	[Date | null, Date | null],
	TimeSeries
> = (start, end) => {
	const by: TransformBy<TimeSeries> = (trx) => {
		const mode = getMode(trx, start, end)
		const map = new Map<string, TimeSeriesPoint>()

		for (const t of trx) {
			const key = getKey(mode, t.date)
			if (!map.has(key)) {
				map.set(key, {
					date: t.date,
					income: 0,
					grossExpense: 0,
					refund: 0,
					netExpense: 0,
					remaining: 0,
					label: getLabel(mode, t.date),
					debt: 0,
					debtRepayment: 0,
					windfall: 0,
					giveaway: 0,
				})
			}
			const entry = map.get(key)!

			switch (t.type) {
				case 'Income':
					entry.income += t.amount.value
					break
				case 'Expense':
					entry.grossExpense += Math.abs(t.amount.value)
					break
				case 'Refund':
					entry.refund += t.amount.value
					break
				case 'Debt':
					entry.debt += Math.abs(t.amount.value)
					break
				case 'DebtRepayment':
					entry.debtRepayment += Math.abs(t.amount.value)
					break
				case 'Windfall':
					entry.windfall += t.amount.value
					break
				case 'Giveaway':
					entry.giveaway += Math.abs(t.amount.value)
					break
			}

			entry.netExpense = entry.grossExpense - entry.refund
			entry.remaining = entry.income - entry.netExpense
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
