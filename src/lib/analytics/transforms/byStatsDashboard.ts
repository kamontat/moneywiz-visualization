import type {
	StatsCadence,
	StatsConcentration,
	StatsConcentrationItem,
	StatsCurrencyMeta,
	StatsDashboard,
	StatsDashboardOptions,
	StatsDelta,
	StatsDeltaDirection,
	StatsDeltaMetric,
	StatsFlowMixItem,
	StatsKpiItem,
	StatsRange,
	TransformBy,
	TransformByFunc,
} from './models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { byCategoryTotal } from './byCategoryTotal'
import { byCategoryVolatility } from './byCategoryVolatility'
import { byOutlierTimeline } from './byOutlierTimeline'
import { byPayeeSpend } from './byPayeeSpend'
import { byRegimeTimeline } from './byRegimeTimeline'
import { bySummarize } from './bySummarize'
import { transform } from './transform'

import { formatDate } from '$lib/formatters/date'

const oneDayMs = 24 * 60 * 60 * 1000
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
): StatsDelta => {
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
	let trend: StatsDelta['trend'] = 'flat'
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
	id: string
	label: string
	unit: StatsKpiItem['unit']
	value: number
	baseline: number | null
	betterWhen: StatsDeltaDirection
}): StatsKpiItem => {
	return {
		id: input.id,
		label: input.label,
		unit: input.unit,
		value: input.value,
		delta: resolveDelta(input.value, input.baseline),
		betterWhen: input.betterWhen,
	}
}

const toComparison = (
	id: string,
	label: string,
	current: number,
	baseline: number | null,
	betterWhen: StatsDeltaDirection
): StatsDeltaMetric => ({
	id,
	label,
	delta: resolveDelta(current, baseline),
	betterWhen,
})

const toHhi = (items: StatsConcentrationItem[]): number => {
	if (items.length === 0) return 0
	return items.reduce((sum, item) => {
		const share = item.share / 100
		return sum + share * share
	}, 0)
}

const toCurrencyMeta = (
	transactions: { amount: { currency: string } }[]
): StatsCurrencyMeta => {
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

const buildCadence = (
	transactions: ParsedTransaction[],
	currentRange: StatsRange
): StatsCadence => {
	const activeDays = new Set<string>()
	const weekdayTotals = new Array<number>(7).fill(0)
	let spendTotal = 0
	let categorizedCount = 0
	let uncategorizedCount = 0
	let payeeCount = 0
	let unknownPayeeCount = 0

	for (const transaction of transactions) {
		activeDays.add(formatDate(transaction.date, 'YYYY-MM-DD'))

		if (
			transaction.type === 'Expense' ||
			transaction.type === 'Giveaway' ||
			transaction.type === 'Debt' ||
			transaction.type === 'Buy'
		) {
			const spend = Math.abs(transaction.amount.value)
			weekdayTotals[transaction.date.getDay()] += spend
			spendTotal += spend
		}

		if ('category' in transaction) {
			categorizedCount += 1
			const category = transaction.category.category.trim()
			const subcategory = transaction.category.subcategory.trim()
			if (!category && !subcategory) {
				uncategorizedCount += 1
			}
		}

		if ('payee' in transaction) {
			payeeCount += 1
			if (!transaction.payee.trim()) {
				unknownPayeeCount += 1
			}
		}
	}

	const weekdaySpend = weekdayTotals.map((amount, index) => ({
		weekday: weekdayLabels[index],
		amount,
		share: spendTotal === 0 ? 0 : (amount / spendTotal) * 100,
	}))

	return {
		activeDays: activeDays.size,
		noSpendDays: Math.max(0, currentRange.days - activeDays.size),
		avgTransactionsPerActiveDay:
			activeDays.size === 0 ? 0 : transactions.length / activeDays.size,
		weekdaySpend,
		uncategorizedRate:
			categorizedCount === 0
				? 0
				: (uncategorizedCount / categorizedCount) * 100,
		unknownPayeeRate:
			payeeCount === 0 ? 0 : (unknownPayeeCount / payeeCount) * 100,
	}
}

export const byStatsDashboard: TransformByFunc<
	[ParsedTransaction[], StatsDashboardOptions?],
	StatsDashboard
> = (baselineTransactions, options = {}) => {
	const by: TransformBy<StatsDashboard> = (transactions) => {
		const summary = transform(transactions, bySummarize())
		const baselineSummary =
			baselineTransactions.length > 0
				? transform(baselineTransactions, bySummarize())
				: null
		const categoryTotals = transform(transactions, byCategoryTotal)
		const payeeAnalysis = transform(transactions, byPayeeSpend(10000))
		const regimes = transform(transactions, byRegimeTimeline)
		const outliers = transform(transactions, byOutlierTimeline)
		const volatility = transform(transactions, byCategoryVolatility)

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
		const baselineIncomeDaily =
			baselineSummary && baselineDays
				? baselineSummary.totalIncome / baselineDays
				: null
		const baselineExpenseDaily =
			baselineSummary && baselineDays
				? baselineSummary.netExpenses / baselineDays
				: null

		const debtLoad = summary.totalDebt + summary.totalDebtRepayment
		const baselineDebtLoad = baselineSummary
			? baselineSummary.totalDebt + baselineSummary.totalDebtRepayment
			: null
		const investingNet = summary.totalSell - summary.totalBuy
		const baselineInvestingNet = baselineSummary
			? baselineSummary.totalSell - baselineSummary.totalBuy
			: null

		const kpis: StatsKpiItem[] = [
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
				baseline: baselineIncomeDaily,
				betterWhen: 'higher',
			}),
			toKpi({
				id: 'dailyExpense',
				label: 'Daily Avg Expense',
				unit: 'currency',
				value: summary.netExpenses / currentDays,
				baseline: baselineExpenseDaily,
				betterWhen: 'lower',
			}),
			toKpi({
				id: 'debtLoad',
				label: 'Debt Load',
				unit: 'currency',
				value: debtLoad,
				baseline: baselineDebtLoad,
				betterWhen: 'lower',
			}),
			toKpi({
				id: 'investingNet',
				label: 'Investing Net (Sell - Buy)',
				unit: 'currency',
				value: investingNet,
				baseline: baselineInvestingNet,
				betterWhen: 'higher',
			}),
		]

		const comparison: StatsDeltaMetric[] = [
			toComparison(
				'income',
				'Income',
				summary.totalIncome,
				baselineSummary?.totalIncome ?? null,
				'higher'
			),
			toComparison(
				'netExpense',
				'Net Expense',
				summary.netExpenses,
				baselineSummary?.netExpenses ?? null,
				'lower'
			),
			toComparison(
				'netCashFlow',
				'Net Cash Flow',
				summary.netCashFlow,
				baselineSummary?.netCashFlow ?? null,
				'higher'
			),
			toComparison(
				'savingsRate',
				'Savings Rate',
				summary.savingsRate,
				baselineSummary?.savingsRate ?? null,
				'higher'
			),
		]

		const flowMixSeed: Array<{ id: string; label: string; amount: number }> = [
			{ id: 'income', label: 'Income', amount: summary.totalIncome },
			{ id: 'expense', label: 'Expense', amount: summary.grossExpenses },
			{ id: 'refund', label: 'Refund', amount: summary.totalRefunds },
			{ id: 'debt', label: 'Debt', amount: summary.totalDebt },
			{
				id: 'debtRepayment',
				label: 'Debt Repayment',
				amount: summary.totalDebtRepayment,
			},
			{ id: 'windfall', label: 'Windfall', amount: summary.totalWindfall },
			{ id: 'giveaway', label: 'Giveaway', amount: summary.totalGiveaway },
			{ id: 'buy', label: 'Buy', amount: summary.totalBuy },
			{ id: 'sell', label: 'Sell', amount: summary.totalSell },
		]
		const flowDenominator = flowMixSeed.reduce(
			(sum, item) => sum + Math.abs(item.amount),
			0
		)
		const flowMix: StatsFlowMixItem[] = flowMixSeed.map((item) => ({
			...item,
			share:
				flowDenominator === 0
					? 0
					: (Math.abs(item.amount) / flowDenominator) * 100,
		}))

		const topCategoryLimit = options.topCategoryLimit ?? 5
		const categoryParents = Object.entries(
			categoryTotals.Expense?.parents ?? {}
		)
		const categoryTotal = categoryParents.reduce(
			(sum, [, entry]) => sum + Math.abs(entry.total),
			0
		)
		const topCategories: StatsConcentrationItem[] = categoryParents
			.sort(
				([, left], [, right]) => Math.abs(right.total) - Math.abs(left.total)
			)
			.slice(0, topCategoryLimit)
			.map(([name, entry]) => {
				const amount = Math.abs(entry.total)
				return {
					name,
					amount,
					share: categoryTotal === 0 ? 0 : (amount / categoryTotal) * 100,
				}
			})

		const topPayeeLimit = options.topPayeeLimit ?? 8
		const allPositivePayees = payeeAnalysis.topPayees
		const payeeTotal = payeeAnalysis.totalNetSpend
		const topPayees: StatsConcentrationItem[] = allPositivePayees
			.slice(0, topPayeeLimit)
			.map((payee) => ({
				name: payee.payee,
				amount: payee.netSpend,
				share: payeeTotal === 0 ? 0 : (payee.netSpend / payeeTotal) * 100,
			}))

		const concentration: StatsConcentration = {
			topCategories,
			topPayees,
			categoryHhi: toHhi(
				categoryParents.map(([name, entry]) => {
					const amount = Math.abs(entry.total)
					return {
						name,
						amount,
						share: categoryTotal === 0 ? 0 : (amount / categoryTotal) * 100,
					}
				})
			),
			payeeHhi: toHhi(
				allPositivePayees.map((payee) => ({
					name: payee.payee,
					amount: payee.netSpend,
					share: payeeTotal === 0 ? 0 : (payee.netSpend / payeeTotal) * 100,
				}))
			),
		}

		const regimeCounts = regimes.reduce(
			(acc, segment) => {
				if (segment.regime === 'Stable') acc.stable += 1
				else if (segment.regime === 'Stressed') acc.stressed += 1
				else acc.deficit += 1
				return acc
			},
			{ stable: 0, stressed: 0, deficit: 0 }
		)
		const outlierDays = outliers.filter((point) => point.isOutlier).length
		const risk = {
			regimeCounts,
			outlierDays,
			totalDays: outliers.length,
			outlierDayRate:
				outliers.length === 0 ? 0 : (outlierDays / outliers.length) * 100,
			topVolatileCategories: volatility.slice(0, options.volatilityLimit ?? 5),
		}

		const cadence = buildCadence(transactions, currentRange)

		return {
			currentRange,
			baselineRange,
			transactionCount: transactions.length,
			baselineTransactionCount: baselineTransactions.length,
			currency: toCurrencyMeta(transactions),
			kpis,
			comparison,
			flowMix,
			concentration,
			risk,
			cadence,
		}
	}

	by.type = 'byStatsDashboard'
	return by
}
