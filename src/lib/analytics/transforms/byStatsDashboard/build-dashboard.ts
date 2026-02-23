import type {
	StatsConcentration,
	StatsConcentrationItem,
	StatsDashboard,
	StatsDashboardOptions,
	StatsDeltaMetric,
	StatsFlowMixItem,
	StatsKpiItem,
} from '$lib/analytics/transforms/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { buildCadence } from './cadence'
import { toComparison, toCurrencyMeta, toHhi, toKpi } from './metrics'
import { toRange } from './range'

import { byCategoryTotal } from '$lib/analytics/transforms/byCategoryTotal'
import { byCategoryVolatility } from '$lib/analytics/transforms/byCategoryVolatility'
import { byOutlierTimeline } from '$lib/analytics/transforms/byOutlierTimeline'
import { byPayeeSpend } from '$lib/analytics/transforms/byPayeeSpend'
import { byRegimeTimeline } from '$lib/analytics/transforms/byRegimeTimeline'
import { bySummarize } from '$lib/analytics/transforms/bySummarize'
import { transform } from '$lib/analytics/transforms/transform'

export const buildStatsDashboard = (
	transactions: ParsedTransaction[],
	baselineTransactions: ParsedTransaction[],
	options: StatsDashboardOptions
): StatsDashboard => {
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
			? toRange(baselineSummary.dateRange.start, baselineSummary.dateRange.end)
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
	const categoryParents = Object.entries(categoryTotals.Expense?.parents ?? {})
	const categoryTotal = categoryParents.reduce(
		(sum, [, entry]) => sum + Math.abs(entry.total),
		0
	)
	const topCategories: StatsConcentrationItem[] = categoryParents
		.sort(([, left], [, right]) => Math.abs(right.total) - Math.abs(left.total))
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
