import type {
	CashFlowDashboard,
	CashFlowDashboardOptions,
	CashFlowDelta,
	CashFlowKpi,
	StatsRange,
	TransformBy,
	TransformByFunc,
} from '../models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { byCategoryTotal } from './byCategoryTotal'
import { byMonthlyWaterfall } from './byMonthlyWaterfall'
import { bySummarize } from './bySummarize'
import { byTimeSeries } from './byTimeSeries'
import { transform } from './transform'

import { formatDate } from '$lib/formatters/date'

const oneDayMs = 24 * 60 * 60 * 1000

const toDaysInclusive = (start: Date, end: Date): number => {
	const startMs = new Date(start).setHours(0, 0, 0, 0)
	const endMs = new Date(end).setHours(0, 0, 0, 0)
	return Math.max(1, Math.floor((endMs - startMs) / oneDayMs) + 1)
}

const toRange = (start: Date, end: Date): StatsRange => {
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

const resolveDelta = (
	current: number,
	baseline: number | null,
	epsilon = 0.00001
): CashFlowDelta => {
	if (baseline === null) {
		return {
			current,
			baseline: null,
			delta: null,
			deltaPct: null,
			trend: 'na',
		}
	}

	const delta = current - baseline
	let trend: CashFlowDelta['trend'] = 'flat'
	if (delta > epsilon) trend = 'up'
	if (delta < -epsilon) trend = 'down'

	return {
		current,
		baseline,
		delta,
		deltaPct:
			Math.abs(baseline) < epsilon ? null : (delta / Math.abs(baseline)) * 100,
		trend,
	}
}

const toKpi = (input: {
	id: CashFlowKpi['id']
	label: string
	unit: CashFlowKpi['unit']
	value: number
	baseline: number | null
	betterWhen: CashFlowKpi['betterWhen']
}): CashFlowKpi => {
	return {
		id: input.id,
		label: input.label,
		unit: input.unit,
		value: input.value,
		delta: resolveDelta(input.value, input.baseline),
		betterWhen: input.betterWhen,
	}
}

const toCurrencyMeta = (
	transactions: ParsedTransaction[]
): CashFlowDashboard['currency'] => {
	const counts: Record<string, number> = {}

	for (const transaction of transactions) {
		const currency = transaction.amount.currency || 'Unknown'
		counts[currency] = (counts[currency] ?? 0) + 1
	}

	let primaryCurrency = 'THB'
	let max = 0

	for (const [currency, count] of Object.entries(counts)) {
		if (count > max) {
			max = count
			primaryCurrency = currency
		}
	}

	return {
		primaryCurrency,
		mixedCurrency: Object.keys(counts).length > 1,
		counts,
	}
}

export const byCashFlowDashboard: TransformByFunc<
	[ParsedTransaction[], CashFlowDashboardOptions?],
	CashFlowDashboard
> = (baselineTransactions, options = {}) => {
	const by: TransformBy<CashFlowDashboard> = (transactions) => {
		const summary = transform(transactions, bySummarize())
		const baselineSummary =
			baselineTransactions.length > 0
				? transform(baselineTransactions, bySummarize())
				: null

		const currentRange =
			options.currentRange ??
			toRange(summary.dateRange.start, summary.dateRange.end)
		const baselineRange =
			options.baselineRange ??
			(baselineSummary
				? toRange(
						baselineSummary.dateRange.start,
						baselineSummary.dateRange.end
					)
				: null)

		const currentDays = Math.max(1, currentRange.days)
		const baselineDays = baselineRange ? Math.max(1, baselineRange.days) : null
		const baselineDailyIncome =
			baselineSummary && baselineDays
				? baselineSummary.totalIncome / baselineDays
				: null
		const baselineDailyExpense =
			baselineSummary && baselineDays
				? baselineSummary.netExpenses / baselineDays
				: null

		const kpis: CashFlowKpi[] = [
			toKpi({
				id: 'netCashFlow',
				label: 'Net Cash Flow',
				unit: 'currency',
				value: summary.netCashFlow,
				baseline: baselineSummary?.netCashFlow ?? null,
				betterWhen: 'higher',
			}),
			toKpi({
				id: 'savingsRate',
				label: 'Savings Rate',
				unit: 'percent',
				value: summary.savingsRate,
				baseline: baselineSummary?.savingsRate ?? null,
				betterWhen: 'higher',
			}),
			toKpi({
				id: 'dailyIncome',
				label: 'Daily Avg Income',
				unit: 'currency',
				value: summary.totalIncome / currentDays,
				baseline: baselineDailyIncome,
				betterWhen: 'higher',
			}),
			toKpi({
				id: 'dailyExpense',
				label: 'Daily Avg Expense',
				unit: 'currency',
				value: summary.netExpenses / currentDays,
				baseline: baselineDailyExpense,
				betterWhen: 'lower',
			}),
		]

		return {
			currentRange,
			baselineRange,
			transactionCount: transactions.length,
			baselineTransactionCount: baselineTransactions.length,
			currency: toCurrencyMeta(transactions),
			kpis,
			trend: transform(
				transactions,
				byTimeSeries(currentRange.start, currentRange.end)
			),
			decomposition: transform(transactions, byMonthlyWaterfall),
			categoryDrivers: transform(transactions, byCategoryTotal),
		}
	}

	by.type = 'byCashFlowDashboard'
	return by
}
